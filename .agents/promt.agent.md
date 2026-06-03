Bạn là coding agent trong dự án React hiện tại. Hãy refactor luồng mint NFT để mint theo mạng người dùng đang dùng, và cấu hình contract address trực tiếp trong networks.js thay vì .env.

Mục tiêu:
1. User ở mạng nào thì mint trên mạng đó.
2. Contract address của NFT được lấy từ cấu hình mạng trong networks.js.
3. Không làm hỏng gameplay 2048 và các luồng wallet hiện có.

Yêu cầu chi tiết:

1. Cấu hình contract address trong networks.js
1. Thêm field nftContractAddress vào từng network trong src/blockchain/networks.js.
2. Ít nhất Arc - Testnet phải có address hợp lệ sẵn.
3. Các mạng chưa deploy có thể để rỗng, nhưng phải được xử lý lỗi thân thiện khi mint.
4. Không phụ thuộc vào biến VITE_2048_NFT_CONTRACT_ADDRESS trong .env cho luồng mint nữa.

2. Helper resolve contract theo chain
1. Tạo helper lấy contract address theo chainId hiện tại, ví dụ getMintContractAddressByChainId.
2. Nếu không có address cho chain hiện tại, throw lỗi business rõ ràng để map ra message user-friendly:
Mint is not configured for this network yet.

3. Refactor mint flow đa mạng
1. Bỏ logic ép switch về Arc trước khi mint.
2. Mint bằng chain hiện tại của wallet/user selection.
3. Public client và wallet client phải tạo theo network hiện tại, không hardcode Arc.
4. Explorer tx link sau mint phải dựa vào blockExplorer của network vừa mint.
5. Giữ nguyên các validation hiện có: wallet connected, score > 0, duplicate gameId, trạng thái pending/success/failed.

4. Tương thích và UX
1. Không phá API các hàm hiện có nếu module khác đang dùng.
2. Nếu cần, giữ wrapper cũ để backward compatibility.
3. Xử lý lỗi thân thiện cho các trường hợp:
No wallet extension, reject transaction, missing contract address, wrong chain context.
4. Không hiển thị stack trace cho người dùng.
5. UI text hiển thị bằng English.

5. Test và verify
1. Bổ sung hoặc cập nhật test cho:
resolve contract address từ networks.js theo chainId.
lỗi khi chain không có nftContractAddress.
mint flow dùng đúng chain hiện tại và đúng explorer link.
2. Chạy test và lint, báo kết quả rõ pass/fail.
3. Báo danh sách file đã sửa và lý do ngắn gọn.

Tiêu chí nghiệm thu:
1. Mint không còn phụ thuộc Arc-only.
2. Contract address được lấy từ src/blockchain/networks.js.
3. Không còn phụ thuộc VITE_2048_NFT_CONTRACT_ADDRESS trong luồng mint.
4. Tx explorer link đúng theo mạng vừa mint.
5. Không phát sinh runtime error mới ở luồng chính.