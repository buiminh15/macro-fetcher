/**
 * Script crawl mã cổ phiếu theo từng ngành từ sstock.vn và xuất ra file Excel
 * - Dòng 1: sectorName (mỗi ngành 1 cột)
 * - Các dòng dưới: danh sách mã chứng khoán (code) thuộc ngành đó
 */

const axios = require('axios');
const XLSX = require('xlsx');
const path = require('path');

// Danh sách 42 ngành cần lấy dữ liệu
const SECTORS = [
  { sectorId: 1007, sectorName: "Họ Vingroup" },
  { sectorId: 22, sectorName: "Khai khoáng" },
  { sectorId: 1001, sectorName: "PP xăng dầu & khí đốt" },
  { sectorId: 1003, sectorName: "Công nghiệp nặng" },
  { sectorId: 11, sectorName: "Dầu khí" },
  { sectorId: 16, sectorName: "Đường" },
  { sectorId: 37, sectorName: "Vận tải biển hàng hóa" },
  { sectorId: 27, sectorName: "Ô tô & phụ tùng" },
  { sectorId: 25, sectorName: "Nhựa" },
  { sectorId: 7, sectorName: "Cảng & Kho bãi" },
  { sectorId: 1004, sectorName: "Hàng công nghiệp" },
  { sectorId: 36, sectorName: "Truyền thông & VP phẩm" },
  { sectorId: 2, sectorName: "Bảo hiểm" },
  { sectorId: 1002, sectorName: "Nông nghiệp & Thực phẩm" },
  { sectorId: 5, sectorName: "Bia & rượu" },
  { sectorId: 24, sectorName: "Ngân hàng" },
  { sectorId: 8, sectorName: "Cao su" },
  { sectorId: 29, sectorName: "Sữa" },
  { sectorId: 26, sectorName: "Nước" },
  { sectorId: 39, sectorName: "Công nghệ viễn thông" },
  { sectorId: 5555, sectorName: "Đa ngành" },
  { sectorId: 1005, sectorName: "Dịch vụ tiện ích" },
  { sectorId: 35, sectorName: "Thủy sản" },
  { sectorId: 14, sectorName: "Đồ gia dụng" },
  { sectorId: 23, sectorName: "May mặc" },
  { sectorId: 40, sectorName: "Vật liệu xây dựng" },
  { sectorId: 41, sectorName: "Xây dựng" },
  { sectorId: 17, sectorName: "DV Du lịch & giải trí" },
  { sectorId: 1, sectorName: "Bán lẻ" },
  { sectorId: 33, sectorName: "Thịt & chăn nuôi" },
  { sectorId: 21, sectorName: "Hóa chất" },
  { sectorId: 28, sectorName: "Phân bón & Thuốc BVTV" },
  { sectorId: 19, sectorName: "Hàng không" },
  { sectorId: 15, sectorName: "Dược phẩm & Thiết bị Y tế" },
  { sectorId: 13, sectorName: "Điện" },
  { sectorId: 9, sectorName: "Chứng khoán" },
  { sectorId: 3, sectorName: "Bất động sản" },
  { sectorId: 31, sectorName: "Thép" },
  { sectorId: 38, sectorName: "Vận tải du lịch & đường bộ" },
  { sectorId: 12, sectorName: "Đầu tư tài chính" },
  { sectorId: 4, sectorName: "Khu công nghiệp" },
  { sectorId: 32, sectorName: "Thiết bị điện & điện tử" }
];

// Cấu hình Request
const CONFIG = {
  year: 2026,
  quarter: 2,
  outputFile: 'danh_sach_ma_theo_nganh.xlsx',
  delayMs: 300, // Giãn cách giữa các request để tránh rate-limit
  headers: {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.6',
    'cache-control': 'no-cache',
    'origin': 'https://sstock.vn',
    'pragma': 'no-cache',
    'referer': 'https://sstock.vn/',
    'sec-ch-ua': '"Brave";v="153", "Not_A Brand";v="8", "Chromium";v="153"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',
    'cookie': '__Secure-better-auth.session_token=NGNglEe7fQ6RIFA3DkOiTNvgP2MsGuO7.4pfDduY0lhZqFbjfThBsJesazyowG%2Bp%2BSmxcxmGYgWk%3D; sstock.current_company_full_info={%22label%22:%22AAA%22%2C%22value%22:%22AAA%22%2C%22code%22:%22AAA%22%2C%22sector%22:%22%22%2C%22sectorId%22:%22%22};'
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchSectorStocks(sector) {
  const url = `https://api-feature.sstock.vn/api/v1/sectors/table/other?year=${CONFIG.year}&quarter=${CONFIG.quarter}&sectorId=${sector.sectorId}`;
  
  try {
    const response = await axios.get(url, {
      headers: CONFIG.headers,
      timeout: 10000
    });

    const items = response.data?.data || [];
    // Lấy mã chứng khoán (code), lọc bỏ giá trị rỗng
    const codes = items
      .map(item => item.code || item.stockInfo?.symbol)
      .filter(code => !!code);

    return {
      sectorId: sector.sectorId,
      sectorName: sector.sectorName,
      codes: codes
    };
  } catch (error) {
    console.error(`❌ Lỗi khi lấy ngành "${sector.sectorName}" (ID: ${sector.sectorId}):`, error.message);
    return {
      sectorId: sector.sectorId,
      sectorName: sector.sectorName,
      codes: []
    };
  }
}

async function main() {
  console.log(`🚀 Bắt đầu lấy danh sách mã cổ phiếu cho ${SECTORS.length} ngành...`);
  console.log(`⏱️ Năm: ${CONFIG.year} | Quý: ${CONFIG.quarter}\n`);

  const results = [];

  for (let i = 0; i < SECTORS.length; i++) {
    const sector = SECTORS[i];
    process.stdout.write(`[${i + 1}/${SECTORS.length}] Đang tải: ${sector.sectorName} (ID: ${sector.sectorId})... `);
    
    const sectorData = await fetchSectorStocks(sector);
    results.push(sectorData);

    console.log(`✅ ${sectorData.codes.length} mã`);

    if (i < SECTORS.length - 1) {
      await sleep(CONFIG.delayMs);
    }
  }

  console.log('\n📊 Đang tạo bảng dữ liệu Excel...');

  // Dòng 1: header gồm tên các ngành (mỗi ngành 1 cột)
  // Các dòng sau: danh sách các mã cổ phiếu
  const headerRow = results.map(r => r.sectorName);
  const maxRows = Math.max(...results.map(r => r.codes.length), 0);

  const excelRows = [headerRow];

  for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
    const row = results.map(r => r.codes[rowIndex] || '');
    excelRows.push(row);
  }

  // Khởi tạo Workbook và Worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(excelRows);

  // Tự động căn chỉnh độ rộng cột theo tên ngành
  worksheet['!cols'] = results.map(r => ({
    wch: Math.max(r.sectorName.length + 3, 12)
  }));

  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachNganh');

  // Ghi ra file Excel
  const outPath = path.resolve(__dirname, CONFIG.outputFile);
  XLSX.writeFile(workbook, outPath);

  const totalStocks = results.reduce((sum, r) => sum + r.codes.length, 0);
  console.log(`\n🎉 HOÀN THÀNH XUẤT EXCEL!`);
  console.log(`📁 Đường dẫn file: ${outPath}`);
  console.log(`📈 Tổng số ngành: ${results.length}`);
  console.log(`🏷️ Tổng lượt mã cổ phiếu: ${totalStocks}`);
}

main().catch(err => {
  console.error("Lỗi chương trình:", err);
});