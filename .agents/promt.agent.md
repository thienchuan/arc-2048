
Bạn là senior full-stack blockchain engineer. Hãy tích hợp tính năng mint kết quả game 2048 thành NFT chuẩn ERC-721 trên Arc Network cho workspace hiện tại.

Mục tiêu:
- Khi người chơi game over, cho phép mint 1 NFT đại diện kết quả ván chơi.
- Mỗi NFT phải gắn với 1 gameId duy nhất, không cho mint trùng gameId.
- UI text trong ứng dụng phải là English.

Yêu cầu kỹ thuật bắt buộc:
1. Blockchain network (Arc):
- EVM compatible Arc Network.
- Chain ID: 5042002.
- Gas token: USDC.
- Cấu hình mạng theo docs: https://docs.arc.io/arc-chain#arc-network và RPC endpoints từ tài liệu Arc.

2. Smart contract ERC-721:
- Tạo contract Solidity sử dụng OpenZeppelin ERC721 (có thể dùng ERC721URIStorage nếu cần).
- Đặt tên rõ ràng, ví dụ: Game2048ResultNFT.
- Lưu mapping gameId => đã mint để chặn mint trùng.
- Mint function nhận dữ liệu kết quả và mint cho địa chỉ người chơi.
- Dữ liệu tối thiểu cần được đưa vào metadata/tokenURI:
  - playerAddress
  - score
  - durationSeconds
  - gameId
  - playedAt (unix timestamp)
- Phát event khi mint thành công, ví dụ ResultMinted(player, tokenId, gameId, score, playedAt).
- Có custom error hoặc require message rõ ràng cho các trường hợp: duplicate gameId, invalid score, invalid player.

3. Metadata và tokenURI:
- Thiết kế metadata JSON theo chuẩn ERC-721 metadata.
- Có field name, description, image (nếu chưa có image thì dùng placeholder), attributes.
- attributes phải có ít nhất: Score, Duration, GameId, PlayedAt.
- Trình bày cách lưu metadata:
  - Ưu tiên cách đơn giản để chạy local (có thể dùng base64 on-chain tokenURI),
  - Nếu dùng off-chain (IPFS/server) thì tạo abstraction để dễ thay thế.

4. Frontend integration (React 2048):
- Thêm Connect Wallet button.
- Thêm Mint Result NFT button trong game over popup/screen.
- Chỉ enable mint khi:
  - game over,
  - score hợp lệ,
  - chưa mint gameId hiện tại,
  - wallet đã connect.
- Hiển thị state đầy đủ: idle, waiting wallet confirm, pending tx, success, failed.
- Hiển thị tx hash, tokenId sau khi mint, và explorer link nếu có.
- Có network guard:
  - Nếu sai chain thì yêu cầu switch sang Arc chainId 5042002.
- Xử lý lỗi rõ ràng: user reject, wrong chain, duplicate gameId, RPC timeout/failure, insufficient gas token.

5. Cấu trúc code và config:
- Tách riêng module blockchain config, contract ABI/address, wallet utilities.
- Không hardcode thông tin nhạy cảm trong UI components.
- Dùng biến môi trường cho: RPC URL, contract address, chain settings.
- Giữ nguyên logic game hiện tại, chỉ mở rộng tính năng mint.

6. Testing bắt buộc:
- Contract tests tối thiểu:
  - mint thành công,
  - event đúng dữ liệu,
  - không cho mint trùng gameId,
  - tokenURI/metadata chứa đúng fields.
- Frontend flow test cơ bản:
  - game over -> connect wallet -> mint -> nhận tx hash/tokenId.

7. Bàn giao kết quả:
- Sau khi xong, cung cấp:
  - Danh sách file đã thêm/sửa.
  - Hướng dẫn chạy local từng bước.
  - Lệnh deploy contract.
  - Cách mint và verify giao dịch.
  - Các giả định/hạn chế còn lại (nếu có).

Ràng buộc thực thi:
- Ưu tiên thay đổi nhỏ, đúng trọng tâm.
- Không phá vỡ UI/UX hiện có.
- Code rõ ràng, dễ bảo trì; chỉ thêm comment ngắn ở đoạn phức tạp.