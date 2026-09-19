const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function fetchAndSaveSectorData() {
  const url = 'https://api-feature.sstock.vn/api/v1/sectors/table-ranking-general?from=2025-09-19&sectorId=24';

  const headers = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.7',
    'cache-control': 'no-cache',
    'cookie': '__Secure-better-auth.session_token=NGNglEe7fQ6RIFA3DkOiTNvgP2MsGuO7.4pfDduY0lhZqFbjfThBsJesazyowG%2Bp%2BSmxcxmGYgWk%3D; ph_phc_2O2eCgo6AOpwUykoQ5ufJGvaahcsg9cOPCMp4sZwSMh_posthog=%7B%22%24device_id%22%3A%2201a0b85a-aa2a-72ba-8835-247ea3933111%22%2C%22distinct_id%22%3A%2201a0b85a-aa2a-72ba-8835-247ea3933111%22%2C%22%24sesid%22%3A%5B1789799537722%2C%2201a0b85a-aa5d-77dd-b10e-9067792e5839%22%2C1789799344723%5D%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22https%3A%2F%2Fwww.google.com%2F%22%2C%22u%22%3A%22https%3A%2F%2Fsstock.vn%2Fbang-dien%22%7D%2C%22%24user_state%22%3A%22anonymous%22%7D; __Secure-better-auth.session_data=eyJzZXNzaW9uIjp7InNlc3Npb24iOnsiZXhwaXJlc0F0IjoiMjAyNi0wOS0yNlQwNjoyOToxMi4wMDFaIiwidG9rZW4iOiJOR05nbEVlN2ZRNlJJRkEzRGtPaVROdmdQMk1zR3VPNyIsImNyZWF0ZWRBdCI6IjIwMjYtMDktMTlUMDY6Mjk6MTIuMDAxWiIsInVwZGF0ZWRBdCI6IjIwMjYtMDktMTlUMDY6Mjk6MTIuMDAxWiIsImlwQWRkcmVzcyI6IjExNi45OS40NC40MSIsInVzZXJBZ2VudCI6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8xNTMuMC4wLjAgU2FmYXJpLzUzNy4zNiIsInVzZXJJZCI6IjJVZkh3R0RQMTVSUXUxWnFUZHhtT1lzbDUybks3SHVuIiwiaW1wZXJzb25hdGVkQnkiOm51bGwsImFjdGl2ZU9yZ2FuaXphdGlvbklkIjpudWxsLCJhY3RpdmVUZWFtSWQiOm51bGwsImlkIjoieU5kZHVCdE9nTnRkaVNYdXRyd3dRR2pjWGdvbnR5S1oifSwidXNlciI6eyJuYW1lIjoibWluaGRldiBidWkiLCJlbWFpbCI6Im1pbmhidWkuZGV2QGdtYWlsLmNvbSIsImVtYWlsVmVyaWZpZWQiOnRydWUsImltYWdlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTFlYNEFfVDBNOU0xXy14X0QwSHVpckowWjdLNmpZa3MtYnU0RUlHcEVLRnk1bG9BPXM5Ni1jIiwiY3JlYXRlZEF0IjoiMjAyNi0wOS0xOVQwNjoyNzoxNC40MzNaIiwidXBkYXRlZEF0IjoiMjAyNi0wOS0xOVQwNjoyNzoxNC40MzNaIiwidXNlcm5hbWUiOm51bGwsImRpc3BsYXlVc2VybmFtZSI6bnVsbCwicm9sZSI6InVzZXIiLCJiYW5uZWQiOmZhbHNlLCJiYW5SZWFzb24iOm51bGwsImJhbkV4cGlyZXMiOm51bGwsInVzZXJUeXBlIjpudWxsLCJkaXNwbGF5UGhvbmVOdW1iZXIiOm51bGwsInRyaWFsRXhwaXJlc0F0IjpudWxsLCJpZCI6IjJVZkh3R0RQMTVSUXUxWnFUZHhtT1lzbDUybks3SHVuIn0sInVwZGF0ZWRBdCI6MTc4OTc5OTUzNzgwMiwidmVyc2lvbiI6IjEifSwiZXhwaXJlc0F0IjoxNzg5Nzk5NTk3ODAyLCJzaWduYXR1cmUiOiJKVTRNQkJZd19iQnRVWUVqMkFXOEdCTnd3OFZYemxEeEtVTFM4RDVNb2tzIn0=',
    'origin': 'https://sstock.vn',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': 'https://sstock.vn/',
    'sec-ch-ua': '"Brave";v="153", "Not_A Brand";v="8", "Chromium";v="153"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'
  };

  try {
    console.log('Đang tải dữ liệu từ API...');
    const response = await axios.get(url, { headers });

    const filePath = path.join(__dirname, 'sector_ranking.json');
    
    // Ghi dữ liệu vào file với định dạng đẹp mắt (indent 2 spaces)
    fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2), 'utf-8');
    
    console.log(`✅ Lấy dữ liệu thành công! Đã lưu vào file: ${filePath}`);
  } catch (error) {
    if (error.response) {
      console.error(`❌ Lỗi từ server (${error.response.status}):`, error.response.data);
    } else {
      console.error('❌ Lỗi kết nối:', error.message);
    }
  }
}

fetchAndSaveSectorData();