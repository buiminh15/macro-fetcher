const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

// ⚙️ CẤU HÌNH API INVESTING.COM
const CONFIG = {
  BASE_URL: 'https://endpoints.investing.com/pd-instruments/v1/calendars/economic/events/occurrences',
  DOMAIN_ID: 1,
  COUNTRY_IDS: '5,17', // 5: Mỹ (USD), 17: Việt Nam (VND)
  LIMIT: 200,
  DELAY_MS: 500,       // Nghỉ 0.5s giữa các trang
};

// Helper: Định dạng ngày sang chuẩn ISO của Investing.com
function formatToInvestingDate(dateStr, isEnd = false) {
  if (dateStr.includes('T')) return dateStr;
  const time = isEnd ? '23:59:59.999' : '00:00:00.000';
  return `${dateStr}T${time}+07:00`;
}

// Gọi API bằng curl.exe để vượt qua Cloudflare 403
function requestWithCurl(url) {
  return new Promise((resolve, reject) => {
    const curlArgs = [
      '-s',
      url,
      '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      '-H', 'Origin: https://www.investing.com',
      '-H', 'Referer: https://www.investing.com/',
      '-H', 'Accept: application/json, text/plain, */*'
    ];

    execFile('curl.exe', curlArgs, { maxBuffer: 15 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Curl execution error: ${error.message}`));
      }
      try {
        const json = JSON.parse(stdout);
        resolve(json);
      } catch (err) {
        reject(new Error(`Không parse được JSON (có thể bị Cloudflare chặn): ${stdout.slice(0, 150)}`));
      }
    });
  });
}

/**
 * Hàm lấy toàn bộ dữ liệu 2 tuần (hoặc hơn) bằng vòng lặp cursor
 */
async function fetchAllMacroData(startDateInput, endDateInput) {
  const eventsMap = new Map();
  const occurrencesMap = new Map();

  const formattedStart = formatToInvestingDate(startDateInput, false);
  const formattedEnd   = formatToInvestingDate(endDateInput, true);

  let nextCursor = null;
  let page = 0;
  let hasMore = true;

  console.log(`\n🚀 Bắt đầu crawl dữ liệu Investing.com:`);
  console.log(`   📅 Từ: ${formattedStart}`);
  console.log(`   📅 Đến: ${formattedEnd}`);

  while (hasMore) {
    page++;
    console.log(`\n⏳ Đang tải trang ${page}... ${nextCursor ? `(Cursor: ${nextCursor})` : '(Trang đầu)'}`);

    // Xây dựng URL
    let apiUrl = `${CONFIG.BASE_URL}?domain_id=${CONFIG.DOMAIN_ID}&limit=${CONFIG.LIMIT}` +
                 `&start_date=${encodeURIComponent(formattedStart)}` +
                 `&end_date=${encodeURIComponent(formattedEnd)}` +
                 `&country_ids=${CONFIG.COUNTRY_IDS}`;

    // 💡 LƯU Ý: Param truyền lên là 'cursor'
    if (nextCursor) {
      apiUrl += `&cursor=${encodeURIComponent(nextCursor)}`;
    }

    try {
      const data = await requestWithCurl(apiUrl);

      const events = data.events || [];
      const occurrences = data.occurrences || [];

      // 1. Gộp & khử trùng lặp events
      for (const ev of events) {
        if (ev && ev.event_id != null && !eventsMap.has(ev.event_id)) {
          eventsMap.set(ev.event_id, ev);
        }
      }

      // 2. Gộp & khử trùng lặp occurrences
      for (const occ of occurrences) {
        if (occ && occ.occurrence_id != null && !occurrencesMap.has(occ.occurrence_id)) {
          occurrencesMap.set(occ.occurrence_id, occ);
        }
      }

      console.log(`   ✅ Trang ${page} thành công: +${events.length} events, +${occurrences.length} occurrences.`);

      // 3. Kiểm tra xem còn trang tiếp theo không
      nextCursor = data.next_page_cursor;

      if (!nextCursor) {
        hasMore = false;
        console.log(`\n🎉 Đã lấy xong toàn bộ dữ liệu qua ${page} trang!`);
      } else {
        await new Promise(r => setTimeout(r, CONFIG.DELAY_MS));
      }

    } catch (err) {
      console.error(`❌ Lỗi tại trang ${page}:`, err.message);
      throw err;
    }
  }

  // 4. Sắp xếp occurrences theo thứ tự thời gian tăng dần
  const sortedOccurrences = Array.from(occurrencesMap.values()).sort((a, b) => {
    return new Date(a.occurrence_time) - new Date(b.occurrence_time);
  });

  return {
    events: Array.from(eventsMap.values()),
    next_page_cursor: null,
    occurrences: sortedOccurrences
  };
}

/**
 * Hàm thực thi chính
 */
async function main() {
  const args = process.argv.slice(2);
  const startDate = args[0] || '2026-09-01';
  const endDate   = args[1] || '2026-09-15';

  try {
    const finalData = await fetchAllMacroData(startDate, endDate);

    const fileName = `macro_${startDate}_to_${endDate}.json`;
    const outputPath = path.join(__dirname, fileName);

    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf-8');

    console.log(`\n================ KẾT QUẢ ================`);
    console.log(`📁 File đã xuất: ${outputPath}`);
    console.log(`📊 Tổng sự kiện (events):       ${finalData.events.length}`);
    console.log(`📅 Tổng số liệu (occurrences):  ${finalData.occurrences.length}`);
    console.log(`=========================================\n`);

  } catch (err) {
    console.error(`\nThất bại:`, err.message);
  }
}

main();