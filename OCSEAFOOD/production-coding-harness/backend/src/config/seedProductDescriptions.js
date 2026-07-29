/**
 * seedProductDescriptions.js
 * 
 * Seeds/updates description, detailDescription, cookingSuggestion, and storageInstruction
 * for all 28 products by slug (does NOT delete or recreate products).
 * 
 * Usage: node backend/src/config/seedProductDescriptions.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productDescriptions = [
  // =====================
  // 🦀 CUA — GHẸ (7 SP)
  // =====================
  {
    slug: 'cua-king-do-nauy',
    description: 'Cua Hoàng Đế Đỏ nhập khẩu trực tiếp từ vùng biển Barents, Na Uy — thịt dày nạc trắng mịn, vị ngọt đậm đà đẳng cấp thượng hạng.',
    detailDescription: `<p><strong>Cua Hoàng Đế Đỏ (Red King Crab)</strong> — vua của các loài cua biển sâu, được nhập khẩu trực tiếp từ vùng biển Barents thuộc miền Bắc Na Uy, nơi có dòng nước lạnh trong lành và hệ sinh thái biển nguyên sơ bậc nhất thế giới.</p>
<p>Từng con Cua King Đỏ được tuyển chọn kỹ lưỡng bởi đội ngũ thu mua chuyên nghiệp, đảm bảo tiêu chuẩn sống khỏe trước khi vận chuyển bằng đường hàng không về hệ thống bể oxy chuẩn công nghiệp của OCSEAFOOD.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Càng cua to bản, chắc nịch, sớ thịt trắng mịn dày nạc — xé tơi từng miếng ngọt lịm</li>
<li>Gạch cua béo ngậy vàng ươm, hương vị đậm đà đặc trưng chỉ có ở cua nước lạnh</li>
<li>Thân cua nặng ký, tỷ lệ thịt/vỏ cao — ăn thoả thích không lo ít thịt</li>
<li>Giá trị dinh dưỡng vượt trội: giàu Protein, Omega-3, Vitamin B12, Kẽm và Selen</li>
</ul>
<p>Tại OCSEAFOOD, Cua King Đỏ Na Uy luôn được bán <strong>tươi sống bơi tại bể</strong>, giao hàng trong thùng xốp giữ lạnh chuyên dụng đảm bảo cua đến tay quý khách vẫn còn sống khỏe mạnh.</p>`,
    cookingSuggestion: `<ul>
<li><strong>Hấp bia sả gừng</strong> — Cách chế biến kinh điển giữ trọn 100% vị ngọt thanh tự nhiên của thịt cua King. Hấp cùng 1 lon bia, vài cọng sả đập dập và gừng thái lát trong 25-30 phút. Chấm muối tiêu chanh hoặc muối ớt xanh Nha Trang.</li>
<li><strong>Nướng than hoa phết bơ tỏi</strong> — Chẻ đôi càng cua, phết bơ tỏi phi thơm rồi nướng trên than hoa đỏ rực. Thịt cua chín vàng ươm, thơm lừng béo ngậy.</li>
<li><strong>Cua rang me chua ngọt</strong> — Chặt cua thành khúc, rang với sốt me tự nhiên chua ngọt hài hoà. Thích hợp cho bữa tiệc gia đình đông người.</li>
<li><strong>Lẩu cua hoàng đế</strong> — Nước dùng từ vỏ cua hầm ngọt thanh, thả thêm rau nấm và mì tươi. Vị ngon đậm đà không thể quên.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Cua King sống nên chế biến trong vòng <strong>4-6 giờ</strong> sau khi nhận hàng để đạt độ tươi ngon tối ưu.</li>
<li><strong>Bảo quản ngắn hạn (12-24h):</strong> Giữ cua trong thùng xốp kèm đá gel, đặt nơi thoáng mát. Không ngâm cua trực tiếp trong nước đá.</li>
<li><strong>Cấp đông:</strong> Nếu chưa dùng ngay, hấp chín cua rồi tách thịt, bọc kín màng thực phẩm và cấp đông ở <strong>-18°C</strong> (bảo quản được 2-3 tháng). Rã đông tự nhiên trong ngăn mát trước khi dùng.</li>
<li><strong>Lưu ý:</strong> Không rã đông bằng lò vi sóng vì sẽ làm thịt cua bị dai và mất vị ngọt.</li>
</ul>`
  },
  {
    slug: 'cua-king-xanh',
    description: 'Cua King Xanh sống nhập khẩu loại 1, thịt ngọt lịm mềm bông xốp — dòng cua hoàng đế hiếm có được giới sành ăn săn đón.',
    detailDescription: `<p><strong>Cua King Xanh (Blue King Crab)</strong> — dòng cua hoàng đế quý hiếm nhất trong họ nhà King Crab, được mệnh danh là "ngọc quý đại dương" nhờ lớp vỏ xanh ánh thép đặc trưng và chất lượng thịt vượt trội.</p>
<p>Cua King Xanh tại OCSEAFOOD được nhập khẩu trực tiếp từ vùng biển lạnh sâu, vận chuyển sống bằng đường hàng không và nuôi dưỡng trong bể oxy chuẩn công nghiệp.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Thịt cua trắng ngà, mềm bông xốp hơn King Đỏ — vị ngọt lịm tan trên đầu lưỡi</li>
<li>Càng cua đầy ắp thịt, sớ thịt mịn dày nạc, xé ra từng miếng lớn đã mắt</li>
<li>Gạch son vàng ươm béo ngậy, hương thơm đặc trưng quyến rũ</li>
<li>Trọng lượng lớn từ 1.6kg - 2.9kg/con, tỷ lệ thịt cao</li>
<li>Giàu Protein chất lượng cao, Omega-3, Vitamin B12 và khoáng chất vi lượng</li>
</ul>
<p>Cua King Xanh cực kỳ hiếm trên thị trường Việt Nam, chỉ những đơn vị uy tín như OCSEAFOOD mới có nguồn cung ổn định quanh năm.</p>`,
    cookingSuggestion: `<ul>
<li><strong>Hấp xửng nguyên con</strong> — Cách đơn giản nhất để thưởng thức trọn vẹn vị ngọt bông xốp đặc biệt của King Xanh. Hấp 20-25 phút với lá chanh thái sợi. Chấm mù tạt wasabi + nước tương Nhật.</li>
<li><strong>Sashimi càng cua (ăn sống)</strong> — Với cua King Xanh cực tươi, thịt càng có thể thái mỏng ăn sashimi. Thịt trong suốt giòn ngọt, chấm ponzu hoặc nước tương.</li>
<li><strong>Cua hấp trứng kiểu Nhật (Chawanmushi)</strong> — Tách thịt cua đặt lên mặt trứng hấp mềm mịn, tưới nước dashi nhẹ. Món ăn thanh nhã tinh tế.</li>
<li><strong>Nướng phô mai bơ tỏi</strong> — Chẻ đôi càng, rải phô mai mozzarella và bơ tỏi, nướng vàng giòn. Thịt cua hoà quyện cùng phô mai béo ngậy tuyệt vời.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Cua King Xanh sống nên chế biến trong vòng <strong>4-6 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản tạm (12-24h):</strong> Để cua trong thùng xốp có đá gel giữ lạnh, nhiệt độ 2-5°C. Tuyệt đối không ngâm trực tiếp trong nước đá.</li>
<li><strong>Cấp đông:</strong> Hấp chín → tách thịt → bọc màng thực phẩm → cấp đông <strong>-18°C</strong> (giữ được 2-3 tháng).</li>
<li><strong>Lưu ý:</strong> King Xanh có thịt mềm xốp hơn King Đỏ nên rất dễ bị nhũn nếu để quá lâu ở nhiệt độ phòng. Ưu tiên chế biến sớm nhất có thể.</li>
</ul>`
  },
  {
    slug: 'cua-nau-sofima',
    description: 'Cua Nâu Sofima (Brown Crab) nhập khẩu châu Âu, nổi tiếng với gạch son béo ngậy và thịt càng chắc ngọt, giá thành hợp lý.',
    detailDescription: `<p><strong>Cua Nâu Sofima (Brown Crab / Cancer pagurus)</strong> — giống cua đặc sản nổi tiếng tại châu Âu, được nhập khẩu nguyên con tươi sống từ thương hiệu Sofima uy tín hàng đầu.</p>
<p>Cua Nâu được đánh bắt từ vùng biển Đại Tây Dương lạnh giá, nơi cua phát triển chậm nhưng tích luỹ lượng gạch và thịt đặc biệt dồi dào.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Mai cua chứa đầy <strong>gạch son vàng ươm</strong> — béo ngậy bùi thơm, được giới sành ăn châu Âu mê mẩn</li>
<li>Thịt càng trắng chắc, sớ thịt mịn, vị ngọt nhẹ thanh tao</li>
<li>Kích thước vừa ăn, trọng lượng đều đặn, phù hợp bữa cơm gia đình</li>
<li>Giá thành hợp lý hơn nhiều so với dòng cua King, nhưng chất lượng gạch không hề thua kém</li>
<li>Giàu Omega-3, Protein, Canxi và các khoáng chất thiết yếu</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Hấp nguyên con</strong> — Hấp 15-18 phút, bẻ mai múc gạch son béo ngậy chấm bánh mì nóng giòn. Thịt càng chấm sốt mayonnaise chanh.</li>
<li><strong>Cua Nâu sốt kem (Dressed Crab)</strong> — Kiểu Anh cổ điển: tách gạch và thịt, trộn với gia vị rồi nhồi lại mai. Thưởng thức cùng salad và bánh mì nướng.</li>
<li><strong>Súp cua Nâu kem tươi</strong> — Gạch cua nấu cùng kem tươi, hành tây phi thơm tạo nên món súp sánh mịn đậm đà phong cách Pháp.</li>
<li><strong>Cua rang muối tiêu</strong> — Chặt cua thành miếng, rang cùng muối biển, tiêu đen và tỏi phi. Vị thơm cay nồng nàn.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Nên chế biến trong vòng <strong>6-8 giờ</strong> sau nhận hàng để gạch cua giữ được độ béo ngậy tối ưu.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Để nguyên con trong ngăn mát tủ lạnh 2-4°C, sử dụng trong vòng 24 giờ.</li>
<li><strong>Cấp đông:</strong> Luộc/hấp chín → bọc kín → cấp đông <strong>-18°C</strong> (giữ được 2-3 tháng).</li>
<li><strong>Mẹo:</strong> Gạch cua Nâu rất nhiều nên khi hấp nên úp mai cua xuống dưới để gạch không bị chảy ra ngoài.</li>
</ul>`
  },
  {
    slug: 'cua-nau-sofima-frozen',
    description: 'Cua Nâu Sofima đông lạnh nhập khẩu, cấp đông IQF ngay tại bến cảng giữ trọn vẹn gạch béo và thịt ngọt, tiện lợi chế biến.',
    detailDescription: `<p><strong>Cua Nâu Sofima đông lạnh</strong> — phiên bản đông lạnh IQF (Individual Quick Frozen) của dòng Cua Nâu châu Âu nổi tiếng, được cấp đông siêu tốc ngay tại bến cảng sau khi đánh bắt để giữ trọn vẹn 100% chất lượng tươi sống.</p>
<p>Sản phẩm lý tưởng cho những ai muốn thưởng thức Cua Nâu Sofima chất lượng cao nhưng linh hoạt hơn về thời gian chế biến.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Cấp đông IQF bảo toàn gạch son và thịt càng gần như 100% so với hàng tươi sống</li>
<li>Tiện lợi — lưu trữ dài ngày trong tủ đông, rã đông khi cần là có ngay bữa hải sản cao cấp</li>
<li>Chất lượng Sofima chuẩn châu Âu, truy xuất nguồn gốc rõ ràng</li>
<li>Phù hợp cho bữa tiệc đông người khi cần chuẩn bị trước số lượng lớn</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Hấp sau rã đông</strong> — Rã đông tự nhiên trong ngăn mát 8-12 giờ, sau đó hấp nguyên con 15-18 phút. Chấm muối tiêu chanh hoặc sốt mayonnaise.</li>
<li><strong>Nấu lẩu cua</strong> — Chặt cua thành miếng, nấu cùng nước dùng chua cay. Nước lẩu ngọt đậm đà từ gạch cua tự nhiên.</li>
<li><strong>Cua rang me</strong> — Chặt miếng, rang với sốt me chua ngọt. Món ăn đưa cơm tuyệt vời.</li>
<li><strong>Súp cua bắp</strong> — Gỡ thịt và gạch cua, nấu cùng bắp ngọt và trứng. Món súp nóng hổi cho cả nhà.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Bảo quản đông lạnh:</strong> Giữ nguyên trong tủ đông <strong>-18°C</strong>, hạn sử dụng lên đến <strong>6 tháng</strong> kể từ ngày sản xuất.</li>
<li><strong>Rã đông đúng cách:</strong> Chuyển cua từ ngăn đông sang <strong>ngăn mát tủ lạnh</strong> (2-4°C) trước 8-12 giờ. Không rã đông bằng nước nóng hoặc lò vi sóng.</li>
<li><strong>Sau rã đông:</strong> Chế biến ngay trong vòng <strong>12 giờ</strong>. Tuyệt đối <strong>không tái đông</strong> sản phẩm đã rã đông.</li>
</ul>`
  },
  {
    slug: 'cua-com',
    description: 'Cua Cốm hai da siêu gạch béo ngọt — đặc sản hiếm có dành cho giới sành ăn, thịt mềm bùi vị ngọt thanh tự nhiên.',
    detailDescription: `<p><strong>Cua Cốm (Soft-shell Crab / Cua hai da)</strong> — loại cua đặc biệt được thu hoạch đúng thời điểm lột xác, khi lớp vỏ mới còn mềm mỏng như giấy và bên trong chứa đầy gạch son béo ngậy.</p>
<p>Cua Cốm là đặc sản cực kỳ hiếm và được giới sành ăn săn đón nồng nhiệt bởi hương vị khác biệt hoàn toàn so với cua thông thường.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li><strong>Lớp vỏ mềm mỏng</strong> ăn được luôn — giòn rụm khi chiên, không cần tốn công bóc vỏ</li>
<li><strong>Gạch cua đầy ắp</strong> — gạch son đỏ au béo ngậy bùi thơm, tràn đầy trong mai</li>
<li>Thịt cua mềm mịn, vị ngọt thanh tự nhiên đặc trưng</li>
<li>Giá trị dinh dưỡng cao: giàu Protein, Canxi (ăn cả vỏ), Sắt và Omega-3</li>
<li>Sản lượng hạn chế theo mùa, cực kỳ hiếm trên thị trường</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Chiên giòn nguyên con</strong> — Ướp gia vị nhẹ, lăn bột chiên giòn vàng rụm. Ăn nguyên con luôn cả vỏ — giòn tan, béo ngậy, ngọt đậm.</li>
<li><strong>Rang muối tiêu</strong> — Rang cua cốm cùng muối biển, tiêu đen và tỏi phi thơm. Vỏ cua giòn sần sật hòa quyện vị mặn cay nồng.</li>
<li><strong>Sốt bơ tỏi</strong> — Áp chảo cua cốm với bơ Pháp và tỏi phi vàng. Thơm lừng béo ngậy, thích hợp ăn kèm bánh mì nóng.</li>
<li><strong>Cua cốm hấp bia</strong> — Hấp nhanh 8-10 phút với bia và sả. Giữ nguyên vị ngọt thanh, múc gạch son ăn kèm muối tiêu chanh.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Cua Cốm có vỏ mềm nên <strong>rất dễ hư</strong>, cần chế biến trong vòng <strong>2-4 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản tạm:</strong> Để trong ngăn mát 2-4°C, phủ khăn ẩm, dùng trong vòng 6-8 giờ.</li>
<li><strong>Cấp đông:</strong> Rửa sạch → lau khô → bọc kín từng con → cấp đông <strong>-18°C</strong> (giữ được 1-2 tháng).</li>
<li><strong>Lưu ý đặc biệt:</strong> Cua Cốm vỏ mềm nên tuyệt đối không xếp chồng lên nhau, dễ bị dập nát.</li>
</ul>`
  },
  {
    slug: 'cua-gach-ca-mau',
    description: 'Cua gạch Cà Mau — đặc sản miền Tây nức tiếng, mai đầy gạch son vàng ươm béo ngậy, thịt càng chắc ngọt đậm đà.',
    detailDescription: `<p><strong>Cua Gạch Cà Mau</strong> — niềm tự hào ẩm thực miền Tây Nam Bộ, được mệnh danh là "vàng ròng" của vùng đất Năm Căn. Cua được nuôi tự nhiên trong hệ thống rừng ngập mặn Cà Mau — nơi có hệ sinh thái phong phú bậc nhất Đông Nam Á.</p>
<p>Tại OCSEAFOOD, Cua Gạch Cà Mau được tuyển chọn kỹ lưỡng, chỉ lấy những con cua cái <strong>đầy gạch</strong>, mai nặng chắc, đảm bảo chất lượng thượng hạng.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Mai cua <strong>đầy ắp gạch son</strong> đỏ au — béo ngậy bùi thơm, là linh hồn của món cua Cà Mau</li>
<li>Thịt càng trắng chắc, sớ thịt dày, vị ngọt đậm đà đặc trưng của cua nước mặn tự nhiên</li>
<li>Cua nuôi trong rừng ngập mặn — ăn phiêu sinh vật tự nhiên, không dùng thức ăn công nghiệp</li>
<li>Kích thước lớn, trọng lượng nặng tay — chất lượng vượt xa cua gạch thông thường</li>
<li>Giàu đạm, Canxi, Phốt pho và các vi chất dinh dưỡng thiết yếu</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Cua hấp lá dứa</strong> — Hấp nguyên con 18-20 phút với lá dứa thơm. Bẻ mai bùi bùi gạch son vàng ươm, chấm muối tiêu chanh xanh kiểu miền Tây.</li>
<li><strong>Cua rang me</strong> — Món kinh điển miền Tây: rang cua với sốt me chua ngọt, hành tím phi thơm. Vị chua ngọt hoà quyện gạch cua béo ngậy.</li>
<li><strong>Cua nấu bún riêu</strong> — Gạch cua giã nhuyễn nấu bún riêu nước dùng đậm đà. Thêm rau muống, mắm tôm — hương vị quê nhà đậm chất miền Tây.</li>
<li><strong>Cua sốt tiêu đen</strong> — Chặt miếng, rang với tiêu đen Phú Quốc thơm nồng. Vị cay nồng tiêu đen kết hợp thịt cua ngọt bùi.</li>
<li><strong>Lẩu cua đồng</strong> — Nấu lẩu chua với cua gạch, thả thêm rau nhút, bông súng — đậm chất Nam Bộ.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Cua gạch nên chế biến trong vòng <strong>6-8 giờ</strong> để gạch giữ được độ đặc sệt béo ngậy.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Buộc dây chắc, bọc khăn ẩm, để ngăn mát 2-4°C, dùng trong vòng 24 giờ.</li>
<li><strong>Cấp đông:</strong> Hấp chín → bọc kín từng con → cấp đông <strong>-18°C</strong> (giữ được 1-2 tháng).</li>
<li><strong>Lưu ý:</strong> Không lật ngửa cua khi bảo quản — gạch sẽ bị chảy xuống thân. Luôn để cua <strong>úp mai xuống</strong> hoặc nằm nghiêng.</li>
</ul>`
  },
  {
    slug: 'cua-tuyet',
    description: 'Cua Tuyết (Snow Crab) nhập khẩu tươi sống, chân dài đầy thịt trắng mịn ngọt dai — hải sản cao cấp được thế giới yêu thích.',
    detailDescription: `<p><strong>Cua Tuyết (Snow Crab / Zuwai-gani)</strong> — loài cua biển sâu nổi tiếng thế giới với những chân cua dài tuyệt đẹp chứa đầy thịt trắng mịn ngọt dai. Cua Tuyết tại OCSEAFOOD được nhập khẩu trực tiếp từ vùng biển lạnh giá, đảm bảo chất lượng tươi sống hảo hạng.</p>
<p>Tên gọi "Cua Tuyết" xuất phát từ môi trường sống của chúng — vùng biển lạnh gần Bắc Cực, nơi nhiệt độ nước gần 0°C quanh năm.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Chân cua dài, mảnh mai nhưng chứa đầy thịt — sớ thịt trắng mịn, ngọt dai đặc trưng</li>
<li>Vỏ cua mỏng dễ bóc, tỷ lệ thịt rất cao — ăn sướng tay</li>
<li>Vị ngọt thanh nhẹ, tinh tế hơn King Crab — phù hợp ăn Sashimi hoặc Shabu-shabu</li>
<li>Là nguyên liệu cao cấp trong ẩm thực Nhật Bản (Kaiseki) và Pháp</li>
<li>Giàu Protein ít béo, Omega-3, Vitamin B12 và khoáng chất biển</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Hấp nguyên con kiểu Nhật</strong> — Hấp 15-18 phút, bẻ chân chấm giấm ponzu hoặc nước tương wasabi. Tận hưởng vị ngọt thanh tinh khiết.</li>
<li><strong>Shabu-shabu (lẩu nhúng)</strong> — Thái thịt chân cua mỏng, nhúng nhanh 3-5 giây trong nước dùng kombu nóng bỏng. Chấm sốt ponzu goma.</li>
<li><strong>Sashimi cua Tuyết</strong> — Với cua cực tươi, thịt chân có thể ăn sống kiểu sashimi. Giòn ngọt thanh, chấm nước tương nhẹ.</li>
<li><strong>Cua Tuyết nướng muối</strong> — Nướng chân cua trên bếp than với chút muối biển. Vỏ cháy nhẹ, thịt bên trong ngọt mềm thơm phức.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Cua Tuyết tươi sống nên chế biến trong vòng <strong>4-6 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Để trong thùng xốp kèm đá gel 2-5°C, dùng trong vòng 12-24 giờ.</li>
<li><strong>Cấp đông:</strong> Hấp chín → tách chân → bọc kín → cấp đông <strong>-18°C</strong> (giữ được 3 tháng).</li>
<li><strong>Lưu ý:</strong> Chân cua Tuyết mỏng vỏ nên dễ gãy. Xếp nhẹ nhàng, không chồng nặng lên nhau khi bảo quản.</li>
</ul>`
  },

  // =====================
  // 🦐 TÔM (8 SP)
  // =====================
  {
    slug: 'tom-hum-bong-viet-nam',
    description: 'Tôm Hùm Bông thiên nhiên Việt Nam bơi sống tại bể, thịt chắc ngọt đậm đà — vua hải sản đặc trưng vùng biển Khánh Hoà, Phú Yên.',
    detailDescription: `<p><strong>Tôm Hùm Bông (Panulirus ornatus)</strong> — vua hải sản Việt Nam, được đánh bắt tự nhiên từ vùng biển Khánh Hoà, Phú Yên — nơi có dòng nước trong xanh và hệ sinh thái san hô đa dạng bậc nhất.</p>
<p>Tại OCSEAFOOD, Tôm Hùm Bông thiên nhiên được tuyển chọn từng con, đảm bảo sống khỏe bơi mạnh tại bể oxy, giao đến tay quý khách trong trạng thái tươi sống hoàn hảo.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Thịt tôm <strong>trắng trong, chắc nịch, dai ngọt</strong> — vị ngọt đậm đà hơn hẳn tôm hùm nuôi</li>
<li>Vỏ tôm hoạ tiết hoa văn sặc sỡ tuyệt đẹp, đặc trưng không lẫn vào đâu</li>
<li>Đầu tôm chứa <strong>gạch son vàng ươm</strong> béo ngậy — phần tinh tuý nhất</li>
<li>Trọng lượng đa dạng từ 1.0kg đến 3.0kg, phù hợp mọi quy mô bữa tiệc</li>
<li>Nguồn đạm sạch tự nhiên, giàu Protein, Omega-3, Kẽm, Selen và Vitamin E</li>
</ul>
<p>Tôm Hùm Bông thiên nhiên luôn là lựa chọn hàng đầu cho các bữa tiệc sang trọng, đãi khách quý hay các dịp lễ trọng đại.</p>`,
    cookingSuggestion: `<ul>
<li><strong>Hấp nước dừa tươi</strong> — Hấp tôm hùm nguyên con với nước dừa xiêm, sả và lá dứa trong 20-25 phút. Thịt tôm ngọt thanh thấm hương dừa nhẹ nhàng. Chấm muối ớt xanh Nha Trang.</li>
<li><strong>Tôm hùm nướng phô mai</strong> — Chẻ đôi tôm hùm, phết bơ tỏi và phô mai mozzarella, nướng vàng giòn. Thịt tôm ngọt béo hoà quyện phô mai sánh mịn.</li>
<li><strong>Tôm hùm sốt XO</strong> — Xào tôm hùm chặt khúc cùng sốt XO thượng hạng, hành lá. Vị đậm đà cay nhẹ, thịt tôm giòn sần sật.</li>
<li><strong>Sashimi tôm hùm</strong> — Với tôm cực tươi, thịt đuôi thái lát mỏng ăn sống. Giòn dai ngọt lịm, chấm wasabi + nước tương.</li>
<li><strong>Cháo tôm hùm</strong> — Nấu cháo từ đầu và vỏ tôm hùm — nước ngọt lừ. Thịt tôm xé nhỏ rải lên mặt, thêm hành phi và tiêu xay.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Tôm hùm sống nên chế biến trong vòng <strong>4-6 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản tạm:</strong> Để tôm trong thùng xốp kèm đá gel, phủ khăn ẩm, giữ ở 5-8°C. Dùng trong 12 giờ.</li>
<li><strong>Cấp đông:</strong> Luộc/hấp chín nhanh → bọc kín → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Lưu ý:</strong> Không ngâm tôm hùm sống trong nước ngọt — tôm sẽ chết ngay lập tức. Giữ ẩm bằng khăn ướt nước biển hoặc đá gel.</li>
</ul>`
  },
  {
    slug: 'tom-hum-do-tay-uc',
    description: 'Tôm Hùm Đỏ Tây Úc (Western Rock Lobster) nhập khẩu bơi sống, thịt ngọt thanh dai giòn — hải sản thượng hạng từ bờ biển phía Tây nước Úc.',
    detailDescription: `<p><strong>Tôm Hùm Đỏ Tây Úc (Western Rock Lobster)</strong> — loài tôm hùm cao cấp nhất từ bờ biển phía Tây nước Úc, nổi tiếng toàn cầu nhờ chất lượng thịt vượt trội và quy trình đánh bắt bền vững được chứng nhận quốc tế (MSC Certified).</p>
<p>OCSEAFOOD nhập khẩu Tôm Hùm Đỏ Tây Úc trực tiếp từ nguồn, vận chuyển sống bằng đường hàng không chuyên dụng, đảm bảo tôm đến tay quý khách trong trạng thái tươi sống khoẻ mạnh.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Lớp vỏ đỏ rực rỡ bắt mắt, thân hình cân đối chắc khoẻ</li>
<li>Thịt tôm <strong>trắng ngà, dai giòn sần sật</strong>, vị ngọt thanh tinh khiết đặc trưng của vùng biển sạch</li>
<li>Đuôi tôm dày thịt, ít xơ — phần thịt ngon nhất dùng cho sashimi hoặc áp chảo</li>
<li>Đầu tôm chứa gạch son thơm béo, nấu cháo hoặc nấu nước dùng cực ngọt</li>
<li>Nguồn đạm sạch cao cấp, giàu Protein, ít béo, giàu Omega-3 và Vitamin A</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Hấp xửng kiểu Úc</strong> — Hấp nguyên con 18-22 phút, thịt tôm chín trắng ngà giòn dai. Chấm sốt bơ chanh ấm (warm butter lemon sauce) kiểu Úc.</li>
<li><strong>Tôm hùm nướng Thermidor</strong> — Phong cách Pháp cổ điển: chẻ đôi, phủ sốt kem trứng phô mai, nướng au gratin vàng rộm. Hương vị sang trọng đẳng cấp.</li>
<li><strong>Áp chảo bơ tỏi</strong> — Thái đuôi tôm thành medallion, áp chảo nhanh với bơ Pháp và tỏi phi. Thịt tôm giòn ngoài mềm trong, thơm phức.</li>
<li><strong>Sashimi đuôi tôm hùm</strong> — Thái lát mỏng thịt đuôi sống, chấm ponzu hoặc nước tương wasabi. Giòn dai ngọt thanh tuyệt vời.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Chế biến trong vòng <strong>4-6 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản tạm:</strong> Để tôm trong thùng xốp kèm đá gel, phủ khăn ẩm nước biển. Dùng trong 8-12 giờ.</li>
<li><strong>Cấp đông:</strong> Hấp chín nhanh → bọc kín → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Lưu ý:</strong> Tôm hùm Tây Úc nhạy cảm với nước ngọt và nhiệt độ cao. Không để tôm tiếp xúc trực tiếp với đá ướt.</li>
</ul>`
  },
  {
    slug: 'tom-hum-alaska',
    description: 'Tôm Hùm Alaska (Boston Lobster) nhập khẩu trực tiếp từ Canada, bơi sống tại bể — càng to đầy thịt, vị ngọt đậm đà đặc trưng.',
    detailDescription: `<p><strong>Tôm Hùm Alaska (American/Boston Lobster)</strong> — biểu tượng hải sản Bắc Mỹ, được nhập khẩu trực tiếp từ vùng biển lạnh Canada. Đây là loài tôm hùm có càng (Clawed Lobster) nổi tiếng nhất thế giới, được yêu thích tại mọi nhà hàng hải sản cao cấp.</p>
<p>OCSEAFOOD nhập khẩu Tôm Hùm Alaska tươi sống quanh năm, nuôi trong bể oxy chuẩn công nghiệp, đảm bảo tôm luôn khoẻ mạnh bơi lội.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li><strong>Đôi càng lớn</strong> chắc nịch — chứa đầy thịt trắng nạc, sớ thịt dày, ngọt đậm</li>
<li>Đuôi tôm dày thịt, dai giòn, phù hợp nướng, áp chảo hoặc ăn sashimi</li>
<li>Đa dạng size từ <strong>400g (Chix) đến 3.5kg</strong>, phục vụ mọi nhu cầu từ ăn lẻ đến tiệc lớn</li>
<li>Gạch tôm (tomalley) xanh lục đặc trưng — béo bùi thơm, dùng nấu sốt lobster bisque</li>
<li>Giàu Protein chất lượng cao, ít calo, giàu Omega-3, Vitamin B12 và khoáng chất</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Hấp nguyên con</strong> — Hấp 12-20 phút (tuỳ size), thịt chín trắng ngà ngọt lành. Chấm bơ nóng tan chảy (drawn butter) kiểu Mỹ truyền thống.</li>
<li><strong>Tôm hùm nướng bơ tỏi</strong> — Chẻ đôi dọc thân, phết bơ tỏi phi thơm, nướng 10-12 phút trên than hoa. Thịt tôm vàng ươm thơm phức.</li>
<li><strong>Lobster Roll</strong> — Món ăn đường phố kinh điển Mỹ: thịt tôm hùm xé nhỏ trộn mayonnaise, nhồi vào bánh mì brioche nướng giòn.</li>
<li><strong>Lobster Bisque</strong> — Súp kem tôm hùm sánh mịn, nấu từ vỏ và gạch tôm hầm cùng kem tươi. Hương vị đậm đà sang trọng.</li>
<li><strong>Mì Ý tôm hùm</strong> — Xào thịt tôm hùm với tỏi, ớt, rượu trắng và cà chua bi. Trộn cùng spaghetti al dente.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Tôm hùm Alaska sống nên chế biến trong vòng <strong>6-8 giờ</strong> sau nhận hàng (loài này khá khoẻ, sống lâu hơn tôm hùm gai).</li>
<li><strong>Bảo quản tạm:</strong> Giữ tôm trong thùng xốp kèm đá gel, phủ khăn ẩm lạnh. Dùng trong 12-24 giờ.</li>
<li><strong>Cấp đông:</strong> Hấp/luộc chín → tách thịt → bọc kín → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Lưu ý:</strong> Để tôm hùm sống, <strong>buộc chặt càng</strong> bằng dây cao su để tránh tôm tự cắn nhau gây chết.</li>
</ul>`
  },
  {
    slug: 'tom-hum-xanh',
    description: 'Tôm Hùm Xanh (Green Lobster) nhập khẩu tươi sống bơi khỏe, thịt ngọt dai giòn đặc trưng — lựa chọn cao cấp cho các bữa tiệc.',
    detailDescription: `<p><strong>Tôm Hùm Xanh (Green Lobster / Panulirus versicolor)</strong> — loài tôm hùm gai cao cấp được nhập khẩu tươi sống, nổi bật với lớp vỏ xanh ánh ngọc bích tuyệt đẹp và chất lượng thịt thượng hạng.</p>
<p>OCSEAFOOD tuyển chọn kỹ lưỡng từng con Tôm Hùm Xanh, chỉ nhập những con khoẻ mạnh nhất, nuôi dưỡng trong bể oxy trước khi giao đến tay quý khách.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Vỏ tôm xanh ngọc bích óng ánh, vẻ đẹp sang trọng khi trình bày trên bàn tiệc</li>
<li>Thịt tôm <strong>dai giòn sần sật</strong>, vị ngọt đậm đà, sớ thịt trắng mịn chắc nịch</li>
<li>Size lớn 3-5 con/kg, phù hợp hấp nguyên con hoặc nướng</li>
<li>Đuôi tôm dày thịt, đầu chứa gạch son béo ngậy</li>
<li>Giàu đạm tự nhiên, Omega-3, Kẽm và các khoáng chất biển</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Hấp xả ớt</strong> — Hấp nguyên con 15-20 phút với sả đập dập và ớt sừng. Chấm muối tiêu chanh — giữ trọn vị ngọt dai tự nhiên.</li>
<li><strong>Nướng than hoa</strong> — Chẻ đôi, ướp nhẹ muối tiêu, nướng than hoa 8-10 phút. Thịt tôm chín vàng, thơm khói, ngọt lành.</li>
<li><strong>Tôm hùm chiên bơ tỏi</strong> — Chặt khúc, chiên giòn với bơ tỏi và lá cà ri. Vỏ giòn rụm, thịt bên trong mềm ngọt.</li>
<li><strong>Lẩu tôm hùm</strong> — Nấu lẩu nước dùng tomyum cay chua, thả tôm hùm chặt khúc. Nước lẩu ngọt đậm từ vỏ và đầu tôm.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Chế biến trong vòng <strong>4-6 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản tạm:</strong> Thùng xốp kèm đá gel, phủ khăn ẩm, 5-8°C. Dùng trong 8-12 giờ.</li>
<li><strong>Cấp đông:</strong> Hấp chín → bọc kín → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Lưu ý:</strong> Không ngâm tôm sống trong nước ngọt. Giữ ẩm bằng khăn ướt nước biển.</li>
</ul>`
  },
  {
    slug: 'tom-hum-bong-uc',
    description: 'Tôm Hùm Bông Úc nhập khẩu tươi sống, thịt trắng ngà chắc dai vị ngọt thanh tinh khiết — dòng tôm hùm cao cấp từ vùng biển sạch nước Úc.',
    detailDescription: `<p><strong>Tôm Hùm Bông Úc (Painted/Ornate Lobster)</strong> — dòng tôm hùm bông nhập khẩu cao cấp từ vùng biển trong xanh của Úc, nổi tiếng với chất lượng thịt vượt trội và quy trình kiểm soát an toàn thực phẩm nghiêm ngặt chuẩn quốc tế.</p>
<p>So với Tôm Hùm Bông Việt Nam, phiên bản Úc có thịt <strong>dai giòn hơn, vị ngọt thanh tinh khiết hơn</strong> nhờ môi trường biển sạch và lạnh hơn.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Thịt tôm trắng ngà trong suốt, chắc dai sần sật, vị ngọt thanh tinh khiết</li>
<li>Hoạ tiết vỏ rực rỡ sặc sỡ, trình bày trên bàn tiệc cực kỳ bắt mắt</li>
<li>Đuôi tôm dài dày thịt — phần thịt quý giá nhất, phù hợp ăn sashimi</li>
<li>Nhập khẩu chính ngạch, truy xuất nguồn gốc rõ ràng, an toàn tuyệt đối</li>
<li>Giàu Protein chất lượng cao, Omega-3, Selen và Vitamin B12</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Hấp xả gừng</strong> — Hấp nguyên con 20-25 phút, thịt tôm chín trắng ngà giòn dai. Chấm muối tiêu chanh hoặc nước mắm Phú Quốc nguyên chất.</li>
<li><strong>Sashimi tôm hùm</strong> — Thái lát mỏng thịt đuôi tươi sống, chấm nước tương wasabi. Giòn ngọt thanh tinh khiết — đỉnh cao ẩm thực.</li>
<li><strong>Tôm hùm nướng phô mai bơ tỏi</strong> — Chẻ đôi, phủ phô mai và bơ tỏi, nướng au gratin. Thịt tôm hoà quyện phô mai béo ngậy.</li>
<li><strong>Cháo tôm hùm</strong> — Đầu và vỏ tôm hầm lấy nước dùng ngọt lừ, thịt tôm xé sợi rải mặt cháo. Thêm hành phi, gừng thái chỉ.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Chế biến trong vòng <strong>4-6 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản tạm:</strong> Thùng xốp kèm đá gel, phủ khăn ẩm, 5-8°C. Dùng trong 8-12 giờ.</li>
<li><strong>Cấp đông:</strong> Hấp chín → bọc kín → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Lưu ý:</strong> Tôm hùm Úc nhập khẩu thường khoẻ mạnh, nhưng vẫn cần giữ ẩm và tránh nước ngọt.</li>
</ul>`
  },
  {
    slug: 'tom-su',
    description: 'Tôm Sú biển tươi sống bơi khỏe, vỏ vằn đen sọc đặc trưng — thịt chắc ngọt đậm đà, phù hợp nướng, hấp, xào.',
    detailDescription: `<p><strong>Tôm Sú biển (Black Tiger Prawn)</strong> — loài tôm lớn nhất trong họ tôm he, nổi tiếng với lớp vỏ vằn đen sọc bắt mắt và chất lượng thịt vượt trội. Tôm Sú tại OCSEAFOOD là tôm biển tự nhiên tươi sống bơi khỏe, không phải tôm nuôi ao.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Vỏ tôm vằn đen sọc đặc trưng, thân to bản chắc khoẻ</li>
<li>Thịt tôm <strong>chắc giòn sần sật</strong>, vị ngọt đậm đà hơn hẳn tôm thẻ chân trắng</li>
<li>Vỏ dày giòn, nướng lên thơm phức — phần vỏ cũng ăn được</li>
<li>Gạch tôm (đầu) béo bùi, thơm ngon</li>
<li>Size lớn đều đặn, trình bày đẹp mắt trên bàn tiệc</li>
<li>Giàu đạm, ít béo, giàu Selen, Vitamin D và Canxi</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Nướng muối ớt</strong> — Xếp tôm nguyên con trên vỉ nướng than hoa, rắc muối biển và ớt bột. Vỏ tôm cháy giòn, thịt bên trong ngọt mềm. Chấm muối tiêu chanh.</li>
<li><strong>Hấp nước dừa</strong> — Hấp tôm nguyên con với nước dừa xiêm tươi và sả 8-10 phút. Thịt tôm ngọt thanh thấm hương dừa nhẹ.</li>
<li><strong>Tôm Sú xào bơ tỏi</strong> — Lột vỏ giữ đuôi, xào nhanh với bơ Pháp và tỏi phi thơm. Thịt tôm giòn dai, bơ tỏi thơm lừng.</li>
<li><strong>Tôm Sú chiên tempura</strong> — Nhúng bột tempura Nhật Bản, chiên giòn vàng. Chấm sốt tentsuyu. Giòn rụm, thịt tôm ngọt mềm bên trong.</li>
<li><strong>Tôm Sú nướng phô mai</strong> — Chẻ lưng, nhồi phô mai mozzarella và bơ tỏi, nướng vàng giòn.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Tôm Sú sống nên chế biến trong vòng <strong>4-6 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Để nguyên trong bọc, bỏ ngăn mát 2-4°C, dùng trong 12-24 giờ.</li>
<li><strong>Cấp đông:</strong> Rửa sạch → để ráo → xếp đều → bọc kín → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Mẹo:</strong> Khi cấp đông, có thể ngâm tôm trong nước muối loãng (1 muỗng muối/1 lít nước) trước khi đông để giữ thịt tôm chắc và giòn hơn khi rã đông.</li>
</ul>`
  },
  {
    slug: 'tom-mu-ni',
    description: 'Tôm Mũ Ni (Tôm Bù Hìn) tươi sống bơi khỏe, thịt ngọt mềm bông xốp — đặc sản biển miền Trung độc đáo hình dáng kỳ lạ.',
    detailDescription: `<p><strong>Tôm Mũ Ni (Slipper Lobster / Tôm Bù Hìn)</strong> — loài tôm biển độc đáo với hình dáng kỳ lạ như chiếc mũ ni cổ, là đặc sản quý của vùng biển miền Trung Việt Nam. Tôm Mũ Ni hiếm gặp trên thị trường do sản lượng đánh bắt thấp.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Hình dáng <strong>dẹp bẹt độc đáo</strong>, vỏ cứng sần sùi tựa vỏ cây</li>
<li>Thịt tôm <strong>mềm bông xốp</strong>, vị ngọt nhẹ thanh tao khác biệt hoàn toàn so với tôm hùm</li>
<li>Đầu tôm to chứa gạch béo bùi thơm ngon</li>
<li>Tỷ lệ thịt/vỏ khá cao — thịt chủ yếu tập trung ở phần đuôi</li>
<li>Sản lượng tự nhiên hạn chế, thuộc hàng đặc sản hiếm có</li>
<li>Giàu Protein, Canxi, Selen và khoáng chất biển</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Hấp xả gừng</strong> — Hấp nguyên con 12-15 phút với sả và gừng thái lát. Thịt tôm mềm bông ngọt thanh. Chấm muối tiêu chanh.</li>
<li><strong>Nướng muối biển</strong> — Bọc tôm trong lớp muối biển dày, nướng 15-18 phút. Bóc vỏ muối ra — thịt tôm chín mềm, thơm vị biển đặc trưng.</li>
<li><strong>Tôm Mũ Ni rang me</strong> — Chặt đôi, rang cùng sốt me chua ngọt tự nhiên. Vị chua ngọt hài hoà, thịt tôm mềm ngọt.</li>
<li><strong>Nấu cháo tôm Mũ Ni</strong> — Vỏ và đầu tôm hầm nước dùng ngọt lừ, thịt tôm xé nhỏ rải mặt cháo. Món ăn bổ dưỡng cho cả nhà.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Chế biến trong vòng <strong>4-6 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Ngăn mát 2-4°C, phủ khăn ẩm, dùng trong 12-24 giờ.</li>
<li><strong>Cấp đông:</strong> Rửa sạch → bọc kín → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Lưu ý:</strong> Tôm Mũ Ni vỏ cứng nên cần dùng kéo cắt đôi theo chiều dọc trước khi chế biến để dễ ăn hơn.</li>
</ul>`
  },
  {
    slug: 'tom-tit',
    description: 'Tôm Tít (Bề Bề / Mantis Shrimp) sống nhảy bành bạch, thịt ngọt thanh giòn dai — đặc sản biển dân dã mà không kém phần hấp dẫn.',
    detailDescription: `<p><strong>Tôm Tít (Mantis Shrimp / Bề Bề / Tôm Tích)</strong> — loài tôm biển dân dã nhưng cực kỳ ngon miệng, được nhiều người yêu hải sản săn đón. Tôm Tít nổi tiếng với khả năng búng nhảy cực mạnh — dấu hiệu của tôm tươi sống khỏe mạnh.</p>
<p>OCSEAFOOD cung cấp Tôm Tít tươi sống bơi nhảy, được đánh bắt từ các ngư trường ven biển miền Trung.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Thân tôm dài, dẹp, vỏ mỏng trong suốt — nhìn rõ thịt bên trong</li>
<li>Thịt tôm <strong>giòn dai sần sật</strong>, vị ngọt thanh tự nhiên đặc trưng</li>
<li>Tôm cái có gạch vàng ươm — béo bùi thơm ngon, rất được ưa chuộng</li>
<li>Giá thành bình dân nhưng hương vị không hề thua kém các loại tôm cao cấp</li>
<li>Giàu đạm, Canxi, Selen và Vitamin B12</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Hấp bia sả</strong> — Xếp tôm tít vào nồi, đổ 1 lon bia, thêm sả đập dập, hấp 8-10 phút. Thịt tôm chín trắng ngọt lành. Chấm muối tiêu chanh.</li>
<li><strong>Rang muối ớt</strong> — Rang tôm tít nguyên con với muối biển, ớt bột và tỏi phi. Vỏ giòn thơm, thịt ngọt đậm vị.</li>
<li><strong>Nướng mọi</strong> — Xếp tôm trên vỉ nướng than hoa, nướng vàng hai mặt 3-4 phút/mặt. Đơn giản nhưng cực ngon.</li>
<li><strong>Tôm tít sốt me</strong> — Chiên giòn rồi tưới sốt me chua ngọt nóng hổi. Giòn rụm, chua ngọt hài hoà.</li>
<li><strong>Gỏi tôm tít</strong> — Luộc chín, bóc vỏ, trộn gỏi với xoài xanh, rau thơm và nước mắm pha. Món khai vị thanh mát.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Tôm tít sống nên chế biến trong vòng <strong>2-4 giờ</strong> — đây là loại tôm chết nhanh nhất.</li>
<li><strong>Bảo quản tạm:</strong> Để trong rổ thoáng, phủ đá vảy, giữ lạnh 2-5°C. Dùng trong 4-6 giờ.</li>
<li><strong>Cấp đông:</strong> Rửa sạch → luộc sơ 2 phút → bọc kín → cấp đông <strong>-18°C</strong> (giữ 1-2 tháng).</li>
<li><strong>Lưu ý:</strong> Tôm tít chết rất nhanh ở nhiệt độ phòng. Nếu tôm ngừng búng nhảy, cần chế biến <strong>ngay lập tức</strong>.</li>
</ul>`
  },

  // =====================
  // 🐚 SÒ — ỐC (9 SP)
  // =====================
  {
    slug: 'oc-tsubugai',
    description: 'Ốc Tsubugai (Ốc Xà Cừ) nhập khẩu Nhật Bản, thịt trắng giòn sần sật ngọt thơm — nguyên liệu sashimi cao cấp hàng đầu.',
    detailDescription: `<p><strong>Ốc Tsubugai (ツブ貝 / Whelk)</strong> — loài ốc biển cao cấp nhập khẩu trực tiếp từ Nhật Bản, nổi tiếng trong ẩm thực Sashimi và Sushi truyền thống. Tsubugai là một trong những loại ốc được giới ẩm thực Nhật đánh giá cao nhất về chất lượng thịt.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Thịt ốc <strong>trắng ngà, giòn sần sật</strong> — texture (kết cấu) tuyệt vời khi ăn sashimi</li>
<li>Vị ngọt thơm nhẹ đặc trưng, hậu vị ngọt kéo dài trên đầu lưỡi</li>
<li>Khi thái mỏng, thịt ốc trong suốt tựa ngọc bích — trình bày cực kỳ bắt mắt</li>
<li>Nhập khẩu chính ngạch từ Nhật Bản, đảm bảo tiêu chuẩn an toàn thực phẩm</li>
<li>Giàu Protein, Taurine tốt cho gan, ít calo, giàu khoáng chất biển</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Sashimi</strong> — Thái lát mỏng thịt ốc tươi, xếp trên đĩa đá lạnh. Chấm nước tương wasabi hoặc ponzu. Giòn sần sật, ngọt thơm tinh tế.</li>
<li><strong>Nướng bơ tỏi</strong> — Nướng nguyên vỏ trên bếp than, tưới bơ tỏi phi thơm. Thịt ốc chín giòn, thấm bơ tỏi béo ngậy.</li>
<li><strong>Xào hành lá</strong> — Thái lát dày, xào nhanh lửa lớn với hành lá và chút dầu mè. Giòn dai, thơm phức.</li>
<li><strong>Sushi nigiri</strong> — Thái butterfly thịt ốc, đặt lên nắm cơm sushi ấm. Phết chút wasabi tươi. Món sushi cổ điển Nhật Bản.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Ốc Tsubugai tươi nên chế biến trong vòng <strong>6-8 giờ</strong> để đạt độ giòn ngọt tối ưu.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Ngăn mát 2-4°C, bọc khăn ẩm, dùng trong 24 giờ.</li>
<li><strong>Cấp đông:</strong> Tách thịt → rửa sạch → bọc kín → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Lưu ý:</strong> Ốc Tsubugai ăn sashimi cần rửa kỹ với nước muối loãng và loại bỏ phần ruột (tuyến nước bọt) để đảm bảo an toàn.</li>
</ul>`
  },
  {
    slug: 'so-diep-song',
    description: 'Sò Điệp sống nhập khẩu từ vùng biển lạnh, cồi trắng ngà căng mọng ngọt bùi — nguyên liệu cao cấp cho sashimi và áp chảo.',
    detailDescription: `<p><strong>Sò Điệp sống (Live Scallop / Hotategai)</strong> — hải sản cao cấp nhập khẩu từ vùng biển lạnh, nổi tiếng với cồi sò trắng ngà mập mạp và hương vị ngọt bùi tự nhiên. Sò Điệp là nguyên liệu không thể thiếu trong ẩm thực Nhật, Pháp và Ý.</p>
<p>OCSEAFOOD cung cấp Sò Điệp sống bơi trong bể, đảm bảo tươi sống khi giao đến tay quý khách.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Cồi sò <strong>trắng ngà, căng mọng, mập mạp</strong> — vị ngọt bùi đậm đà tự nhiên</li>
<li>Vỏ sò còn <strong>bơi khép mở liên tục</strong> — dấu hiệu tươi sống tuyệt đối</li>
<li>Đa dạng size từ 3-5 con/kg (đại) đến 10-12 con/kg (nhỏ)</li>
<li>Phần gân sò (trùm) và trứng sò cũng ăn được — giòn dai, béo bùi</li>
<li>Giàu Protein, Vitamin B12, Kẽm, Omega-3 và Taurine</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Sashimi cồi sò điệp</strong> — Tách cồi sò tươi, thái ngang thành 2-3 lát mỏng, xếp trên đĩa đá lạnh. Chấm ponzu hoặc nước tương wasabi. Ngọt bùi mềm mịn tan trên lưỡi.</li>
<li><strong>Áp chảo bơ Pháp</strong> — Lau khô cồi sò, áp chảo nhanh 90 giây mỗi mặt với bơ Pháp lửa lớn. Vỏ ngoài vàng caramel giòn, bên trong còn hồng mềm (medium-rare). Rắc muối biển fleur de sel.</li>
<li><strong>Nướng mỡ hành</strong> — Nướng nguyên vỏ trên than hoa, tưới mỡ hành phi thơm và đậu phộng giã nhỏ. Cồi sò chín ngọt, mỡ hành thơm bùi.</li>
<li><strong>Sò điệp nướng phô mai</strong> — Rải phô mai mozzarella và bơ tỏi lên cồi sò, nướng vàng giòn. Béo ngậy thơm lừng.</li>
<li><strong>Carpaccio sò điệp</strong> — Thái mỏng cồi sò, xếp đĩa, tưới dầu ô liu, nước chanh và tiêu đen. Khai vị thanh mát kiểu Ý.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Sò điệp sống nên chế biến trong vòng <strong>4-6 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Để sò nguyên vỏ trong ngăn mát 2-4°C, phủ khăn ẩm. Dùng trong 12-24 giờ. <strong>Không</strong> ngâm sò trong nước ngọt.</li>
<li><strong>Cấp đông:</strong> Tách cồi → rửa sạch → lau khô → xếp đều → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Mẹo:</strong> Sò điệp còn sống sẽ khép vỏ khi chạm vào. Nếu sò không phản ứng, loại bỏ ngay.</li>
</ul>`
  },
  {
    slug: 'bao-ngu-han-quoc',
    description: 'Bào Ngư Hàn Quốc bơi sống chất lượng hàng đầu, thịt giòn dai ngọt bùi — hải sản bổ dưỡng quý hiếm được mệnh danh "vàng biển".',
    detailDescription: `<p><strong>Bào Ngư Hàn Quốc (Korean Abalone / Jeonbok)</strong> — loài bào ngư được nuôi trồng theo công nghệ cao tại các trại biển Hàn Quốc, nổi tiếng thế giới về chất lượng đồng đều và giá trị dinh dưỡng vượt trội.</p>
<p>Bào Ngư từ lâu được xem là "vàng biển" trong y học cổ truyền phương Đông, là thực phẩm bổ thận tráng dương, tốt cho gan và hệ miễn dịch.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Thịt bào ngư <strong>giòn dai sần sật</strong>, vị ngọt bùi đậm đà tự nhiên</li>
<li>Còn <strong>bơi sống</strong> khi giao đến — đảm bảo tươi tuyệt đối</li>
<li>Đa dạng size từ 5-6 con/kg (đại) đến 14-15 con/kg (vừa)</li>
<li>Ruột bào ngư (lòng xanh) ăn được — béo bùi thơm ngon</li>
<li><strong>Giá trị dinh dưỡng cực cao:</strong> giàu Protein, Collagen, Vitamin A, B1, B2, Sắt, Canxi, Phốt pho</li>
<li>Trong Đông y: bổ thận, dưỡng gan, sáng mắt, tăng cường sức đề kháng</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Cháo bào ngư</strong> — Nấu cháo trắng nhuyễn, thả bào ngư thái lát nấu chín 3-5 phút. Thêm gừng, hành lá, hạt tiêu. Món ăn bổ dưỡng tuyệt vời cho người bệnh và người cao tuổi.</li>
<li><strong>Bào ngư hấp xả</strong> — Hấp nguyên con 8-10 phút với sả và gừng. Chấm nước mắm gừng. Giòn dai ngọt bùi.</li>
<li><strong>Bào ngư nướng bơ tỏi</strong> — Nướng nguyên vỏ trên than hoa, tưới bơ tỏi phi thơm. Thịt bào ngư chín giòn, bơ tỏi thơm lừng.</li>
<li><strong>Bào ngư sốt dầu hào</strong> — Xào nhanh với dầu hào, hành tím và nấm đông cô. Món ăn đậm đà kiểu Trung Hoa.</li>
<li><strong>Sashimi bào ngư</strong> — Thái lát mỏng thịt bào ngư tươi sống, chấm wasabi nước tương. Giòn sần sật, ngọt thanh tinh khiết.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Bào ngư sống nên chế biến trong vòng <strong>6-12 giờ</strong> (bào ngư khá bền, sống lâu hơn nhiều loại hải sản khác).</li>
<li><strong>Bảo quản ngắn hạn:</strong> Để nguyên vỏ trong ngăn mát 2-4°C, phủ khăn ẩm. Dùng trong 24-48 giờ.</li>
<li><strong>Cấp đông:</strong> Tách thịt → rửa sạch → bọc kín → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Mẹo:</strong> Khi tách thịt bào ngư, dùng thìa luồn dưới thịt và gỡ nhẹ. Loại bỏ phần miệng cứng ở đầu.</li>
</ul>`
  },
  {
    slug: 'hau-vang-han-quoc',
    description: 'Hàu Vàng Hàn Quốc nhập khẩu, thịt vàng ươm mập mạp béo bùi — hải sản giàu kẽm bậc nhất, bổ dưỡng tuyệt vời cho sức khoẻ.',
    detailDescription: `<p><strong>Hàu Vàng Hàn Quốc (Korean Gold Oyster)</strong> — giống hàu đặc biệt với thịt <strong>vàng ươm</strong> mập mạp, được nuôi trồng trong vùng biển sạch Hàn Quốc. Hàu Vàng nổi tiếng là "sữa biển" (milk of the sea) nhờ giá trị dinh dưỡng vượt trội.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Thịt hàu <strong>vàng ươm</strong> mập mạp, béo bùi, vị ngọt mặn đặc trưng hương biển</li>
<li>Khi ăn sống — texture mềm mịn tan trên lưỡi, hậu vị ngọt thanh kéo dài</li>
<li>Vỏ hàu lớn, dày chắc, bên trong chứa nước biển tự nhiên</li>
<li><strong>Giàu Kẽm bậc nhất</strong> trong các loại thực phẩm — tốt cho hệ miễn dịch và sinh lý</li>
<li>Giàu Sắt, Canxi, Vitamin B12, Glycogen và Taurine</li>
<li>Trong y học: tăng cường sinh lực, bổ máu, tốt cho da và tóc</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Ăn sống (Raw)</strong> — Bóc vỏ, vắt chanh tươi và vài giọt Tabasco. Thưởng thức nguyên chất vị biển mặn ngọt béo bùi. Kèm rượu vang trắng lạnh.</li>
<li><strong>Hàu nướng mỡ hành</strong> — Nướng nguyên vỏ trên than hoa, tưới mỡ hành phi thơm béo và đậu phộng rang giã nhỏ. Món nướng kinh điển.</li>
<li><strong>Hàu nướng phô mai</strong> — Rải phô mai mozzarella và bơ tỏi lên thịt hàu, nướng vàng giòn bong bóng. Béo ngậy thơm lừng.</li>
<li><strong>Cháo hàu</strong> — Nấu cháo gạo mới nhuyễn, thả hàu nấu chín 2-3 phút. Thêm gừng, hành lá. Món ăn bổ dưỡng cực kỳ tốt cho sức khoẻ.</li>
<li><strong>Hàu chiên trứng</strong> — Trộn hàu với trứng và bột chiên giòn kiểu Đài Loan (蚵仔煎). Giòn rụm, béo bùi.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Hàu sống nên ăn/chế biến trong vòng <strong>6-12 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Để nguyên vỏ, úp mặt phẳng lên trên, trong ngăn mát 2-4°C. Phủ khăn ẩm. Dùng trong 24-48 giờ.</li>
<li><strong>Không cấp đông hàu sống:</strong> Hàu tươi sống không nên đông lạnh vì sẽ mất hoàn toàn kết cấu mềm mịn.</li>
<li><strong>Lưu ý:</strong> Hàu còn tươi khi vỏ <strong>khép chặt</strong>. Nếu vỏ hé mở và không khép lại khi gõ nhẹ, loại bỏ ngay.</li>
</ul>`
  },
  {
    slug: 'bao-ngu-uc-ngoc-bich',
    description: 'Bào Ngư Úc Ngọc Bích (Greenlip Abalone) nhập khẩu sống, vỏ xanh ngọc lấp lánh — thịt mềm dai ngọt bùi, bổ dưỡng thượng hạng.',
    detailDescription: `<p><strong>Bào Ngư Úc Ngọc Bích (Greenlip Abalone)</strong> — dòng bào ngư cao cấp nhất từ vùng biển trong lành Nam Úc, được đặt tên theo viền vỏ xanh ngọc bích lấp lánh tuyệt đẹp. Đây là loài bào ngư được đánh giá cao nhất thế giới về chất lượng thịt.</p>
<p>OCSEAFOOD nhập khẩu Bào Ngư Úc Ngọc Bích tươi sống, vận chuyển trong hệ thống nước biển tuần hoàn chuyên dụng.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Vỏ bào ngư <strong>ánh xanh ngọc bích</strong> rực rỡ — đẹp mê hồn, trình bày sang trọng</li>
<li>Thịt bào ngư <strong>mềm dai</strong>, vị ngọt bùi đậm đà hơn bào ngư Hàn Quốc</li>
<li>Size lớn từ 6-10 con/kg, thịt dày mập mạp</li>
<li>Nuôi trồng bền vững chuẩn Úc, truy xuất nguồn gốc rõ ràng</li>
<li><strong>Giá trị dinh dưỡng đỉnh cao:</strong> Protein cao, Collagen dồi dào, ít cholesterol, giàu khoáng chất</li>
<li>Đông y: đại bổ thận âm, dưỡng huyết, sáng mắt, tốt cho phụ nữ sau sinh</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Hầm bào ngư nhung hươu</strong> — Hầm chậm bào ngư cùng nhung hươu, táo đỏ, kỷ tử trong 2-3 giờ. Món ăn đại bổ dưỡng trong Đông y.</li>
<li><strong>Bào ngư sốt dầu hào nấm đông cô</strong> — Xào nhanh bào ngư thái lát với dầu hào thượng hạng, nấm đông cô ngâm mềm. Đậm đà thơm ngon kiểu Quảng Đông.</li>
<li><strong>Bào ngư hấp tỏi</strong> — Hấp nguyên con 10-12 phút, tưới nước tương và tỏi phi vàng giòn. Đơn giản nhưng sang trọng.</li>
<li><strong>Sashimi bào ngư</strong> — Thái mỏng thịt bào ngư tươi, chấm ponzu. Giòn dai ngọt bùi tinh tế.</li>
<li><strong>Cháo bào ngư</strong> — Nấu cháo nhuyễn, thả bào ngư thái mỏng nấu chín. Thêm gừng, hành lá, tiêu trắng. Bổ dưỡng tuyệt vời.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Bào ngư Úc sống nên chế biến trong vòng <strong>8-12 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Để nguyên vỏ, ngăn mát 2-4°C, phủ khăn ẩm. Dùng trong 24-48 giờ.</li>
<li><strong>Cấp đông:</strong> Tách thịt → rửa sạch → bọc kín → cấp đông <strong>-18°C</strong> (giữ 3 tháng).</li>
<li><strong>Mẹo:</strong> Bào ngư Úc size lớn nên cần đập nhẹ bằng cán dao trước khi nấu để thịt mềm hơn (giống cách làm abalone steak).</li>
</ul>`
  },
  {
    slug: 'oc-voi-voi-nga',
    description: 'Ốc Vòi Voi Ngà tươi sống nhập khẩu, vòi dài trắng ngà giòn sần sật — hải sản sashimi cao cấp với hương vị biển tinh khiết.',
    detailDescription: `<p><strong>Ốc Vòi Voi Ngà (Geoduck Clam)</strong> — loài nhuyễn thể hai mảnh vỏ nổi tiếng với chiếc vòi dài đặc trưng, được mệnh danh là "vương giả của các loài nghêu sò". Ốc Vòi Voi Ngà tại OCSEAFOOD được nhập khẩu tươi sống, đảm bảo chất lượng thượng hạng.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Vòi ốc dài trắng ngà — phần thịt quý giá nhất, <strong>giòn sần sật</strong> khi ăn sashimi</li>
<li>Vị ngọt thanh tinh khiết, hương biển nhẹ nhàng quyến rũ</li>
<li>Thịt thân (bụng) mềm mịn hơn, phù hợp xào hoặc nấu cháo</li>
<li>Size đa dạng từ 0.5-0.8kg trở lên, mỗi con cho một lượng thịt đáng kể</li>
<li>Tuổi thọ lên đến 150 năm — mỗi con ốc vòi voi là một kỳ tích của tự nhiên</li>
<li>Giàu Protein, Omega-3, Sắt, Kẽm và khoáng chất biển sâu</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Sashimi vòi ốc</strong> — Trụng vòi ốc 5 giây trong nước sôi, nhúng nước đá → lột vỏ → thái lát mỏng. Chấm wasabi nước tương. <strong>Giòn sần sật, ngọt thanh</strong> — đỉnh cao ẩm thực.</li>
<li><strong>Lẩu ốc vòi voi</strong> — Thái vòi ốc mỏng, nhúng nhanh trong nước lẩu nóng 3-5 giây. Giòn dai, ngọt thanh tự nhiên.</li>
<li><strong>Xào tỏi rau muống</strong> — Thái khúc thân ốc, xào lửa lớn với tỏi phi và rau muống. Giòn ngọt, đơn giản mà ngon.</li>
<li><strong>Cháo ốc vòi voi</strong> — Băm nhỏ thịt thân ốc nấu cháo, thả thêm vòi ốc thái mỏng lên mặt. Thêm gừng, hành phi.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Ốc vòi voi sống nên chế biến trong vòng <strong>6-8 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Để nguyên vỏ, ngăn mát 2-4°C, phủ khăn ẩm. Dùng trong 24 giờ.</li>
<li><strong>Cấp đông:</strong> Tách thịt → trụng nhanh → bọc kín → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Lưu ý:</strong> Ốc vòi voi tươi sống sẽ co rút vòi khi chạm vào. Đây là dấu hiệu còn sống khỏe mạnh.</li>
</ul>`
  },
  {
    slug: 'oc-voi-voi-canada-vang',
    description: 'Ốc Vòi Voi Canada Vàng nhập khẩu tươi sống, vòi vàng ươm giòn ngọt đặc biệt — phiên bản cao cấp hiếm có từ bờ biển Thái Bình Dương.',
    detailDescription: `<p><strong>Ốc Vòi Voi Canada Vàng (Pacific Geoduck - Gold)</strong> — phiên bản đặc biệt hiếm có của loài Geoduck, được đánh bắt từ vùng biển Thái Bình Dương Canada. Khác biệt với phiên bản Ngà thông thường, Vòi Voi Vàng có lớp da vòi <strong>vàng ươm</strong> đặc trưng và hương vị đậm đà hơn.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Vòi ốc <strong>màu vàng ươm</strong> đặc trưng — hiếm gặp, giá trị cao</li>
<li>Thịt vòi <strong>giòn sần sật</strong>, vị ngọt đậm đà hơn phiên bản Ngà</li>
<li>Kích thước lớn, thịt dày — cho nhiều phần ăn sashimi</li>
<li>Nhập khẩu chính ngạch từ Canada, truy xuất nguồn gốc rõ ràng</li>
<li>Giàu Protein, Omega-3, Selen và khoáng chất biển Thái Bình Dương</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Sashimi cao cấp</strong> — Trụng vòi 5 giây → nước đá → lột vỏ → thái lát mỏng xếp hoa. Chấm ponzu hoặc nước tương wasabi. Giòn dai ngọt thanh tuyệt hảo.</li>
<li><strong>Lẩu nhúng</strong> — Thái mỏng, nhúng nhanh 3-5 giây trong nước dùng kombu nóng. Chấm sốt ponzu goma.</li>
<li><strong>Nướng than</strong> — Thái khúc dày, xiên nướng than hoa phết bơ tỏi. Giòn ngoài mềm trong.</li>
<li><strong>Gỏi kiểu Thái</strong> — Trụng chín vòi ốc, thái sợi, trộn gỏi cùng xoài xanh, ớt, rau thơm và nước mắm chanh pha.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Chế biến trong vòng <strong>6-8 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Để nguyên vỏ, ngăn mát 2-4°C, phủ khăn ẩm. Dùng trong 24 giờ.</li>
<li><strong>Cấp đông:</strong> Tách thịt → trụng nhanh → bọc kín → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Lưu ý:</strong> Vòi Voi Vàng hiếm có nên cần chế biến cẩn thận, ưu tiên ăn sashimi để tận hưởng trọn vẹn hương vị đặc biệt.</li>
</ul>`
  },
  {
    slug: 'oc-bulot-sofima',
    description: 'Ốc Bulot Sofima đông lạnh nhập khẩu Pháp, thịt giòn dai ngọt thơm — món khai vị thanh nhã chuẩn Âu đẳng cấp nhà hàng.',
    detailDescription: `<p><strong>Ốc Bulot Sofima (Whelk / Bulot)</strong> — loài ốc biển nổi tiếng trong ẩm thực Pháp, được nhập khẩu đông lạnh từ thương hiệu Sofima uy tín châu Âu. Bulot là món khai vị (entrée) không thể thiếu tại các nhà hàng hải sản cao cấp ở Paris.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Thịt ốc <strong>giòn dai</strong>, vị ngọt thơm nhẹ đặc trưng hương biển Đại Tây Dương</li>
<li>Đông lạnh IQF giữ trọn chất lượng, tiện lợi chế biến mọi lúc</li>
<li>Kích thước đều đặn, trình bày đẹp trên đĩa hải sản</li>
<li>Sản phẩm Sofima chuẩn châu Âu, an toàn thực phẩm tuyệt đối</li>
<li>Giàu Protein, ít béo, giàu Sắt, Magiê và Vitamin B12</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Luộc kiểu Pháp</strong> — Luộc ốc với nước court-bouillon (nước dùng thảo mộc: lá nguyệt quế, tiêu đen, cần tây) 15-18 phút. Chấm bơ tỏi (aïoli) hoặc mayonnaise tự làm. Cách ăn cổ điển nhất.</li>
<li><strong>Ốc Bulot sốt bơ tỏi mùi tây</strong> — Tách thịt ốc, xào nhanh với bơ Pháp, tỏi và mùi tây (parsley) băm nhỏ. Thơm phức kiểu bistro Pháp.</li>
<li><strong>Salad ốc Bulot</strong> — Luộc chín, tách thịt, trộn salad với khoai tây luộc, hành tím, mùi tây và vinaigrette. Khai vị thanh mát.</li>
<li><strong>Nướng bơ tỏi</strong> — Nhồi ốc lại vỏ cùng bơ tỏi mùi tây, nướng vàng 8-10 phút kiểu Escargot. Thơm lừng đậm đà.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Bảo quản đông lạnh:</strong> Giữ nguyên trong tủ đông <strong>-18°C</strong>, hạn sử dụng theo bao bì (thường 6-12 tháng).</li>
<li><strong>Rã đông:</strong> Chuyển sang ngăn mát 2-4°C trước 8-12 giờ. Hoặc ngâm bao bì kín trong nước lạnh 30-45 phút.</li>
<li><strong>Sau rã đông:</strong> Chế biến ngay trong vòng <strong>12 giờ</strong>. Tuyệt đối <strong>không tái đông</strong>.</li>
<li><strong>Lưu ý:</strong> Ốc Bulot đông lạnh đã được sơ chế sẵn (làm sạch ruột), chỉ cần luộc/nướng là dùng được ngay.</li>
</ul>`
  },
  {
    slug: 'bao-ngu-dong-lanh',
    description: 'Bào Ngư đông lạnh cấp đông IQF, tiện dụng giữ trọn vị ngọt bùi — lựa chọn bổ dưỡng tiết kiệm cho bữa cơm gia đình.',
    detailDescription: `<p><strong>Bào Ngư đông lạnh</strong> — phiên bản đông lạnh IQF tiện dụng của bào ngư cao cấp, được cấp đông siêu tốc ngay sau thu hoạch để giữ trọn 100% giá trị dinh dưỡng và hương vị.</p>
<p>Sản phẩm lý tưởng cho những ai muốn thưởng thức bào ngư chất lượng cao nhưng tiết kiệm hơn hàng tươi sống, đồng thời tiện lợi lưu trữ dài ngày.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Cấp đông IQF ngay sau thu hoạch — giữ trọn vị ngọt bùi và kết cấu thịt</li>
<li>Đã <strong>làm sạch sơ chế</strong>, chỉ cần rã đông là chế biến được ngay</li>
<li>Giá thành hợp lý hơn nhiều so với bào ngư tươi sống</li>
<li>Tiện lợi lưu trữ trong tủ đông, sẵn sàng cho mọi bữa ăn</li>
<li>Giá trị dinh dưỡng tương đương bào ngư tươi: giàu Protein, Collagen, khoáng chất</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Cháo bào ngư</strong> — Rã đông → thái lát → nấu cháo nhuyễn với gừng, hành lá. Món ăn bổ dưỡng cho cả nhà, đặc biệt tốt cho người cao tuổi.</li>
<li><strong>Bào ngư hầm nấm</strong> — Hầm chậm bào ngư cùng nấm đông cô, táo đỏ, kỷ tử trong 1-2 giờ. Nước hầm ngọt thanh bổ dưỡng.</li>
<li><strong>Bào ngư xào rau cải</strong> — Thái lát, xào nhanh lửa lớn với cải thìa, dầu hào và tỏi phi. Đơn giản, nhanh gọn, ngon miệng.</li>
<li><strong>Bào ngư nướng sốt teriyaki</strong> — Thái dày, ướp sốt teriyaki 15 phút rồi nướng vỉ. Ngọt mặn đậm đà.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Bảo quản đông lạnh:</strong> Giữ nguyên trong tủ đông <strong>-18°C</strong>, hạn sử dụng lên đến <strong>6 tháng</strong> kể từ ngày sản xuất.</li>
<li><strong>Rã đông đúng cách:</strong> Chuyển từ ngăn đông sang <strong>ngăn mát</strong> 2-4°C trước 6-8 giờ. Không rã đông bằng nước nóng.</li>
<li><strong>Sau rã đông:</strong> Chế biến ngay trong vòng <strong>12 giờ</strong>. Tuyệt đối <strong>không tái đông</strong>.</li>
<li><strong>Mẹo:</strong> Bào ngư đông lạnh sau rã đông có thể hơi dai. Đập nhẹ bằng cán dao trước khi nấu để thịt mềm hơn.</li>
</ul>`
  },

  // =====================
  // 🐟 CÁ (4 SP)
  // =====================
  {
    slug: 'ca-bon-vang',
    description: 'Cá Bơn Vàng (Golden Flounder) quý hiếm nhập khẩu, thịt trắng mịn ngọt lành béo bùi — hải sản cao cấp bậc nhất dành cho tiệc sang trọng.',
    detailDescription: `<p><strong>Cá Bơn Vàng (Golden Flounder / Hirame Vàng)</strong> — loài cá bơn quý hiếm nhất trong họ cá bơn, nổi bật với lớp da vàng rực rỡ và chất lượng thịt vượt trội. Đây là nguyên liệu sashimi cao cấp bậc nhất, chỉ xuất hiện tại các nhà hàng Omakase hạng sang.</p>
<p>Cá Bơn Vàng tại OCSEAFOOD được nhập khẩu trực tiếp, vận chuyển sống trong bể nước biển tuần hoàn chuyên dụng.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Da cá <strong>vàng rực</strong> hiếm có — tỷ lệ xuất hiện trong tự nhiên cực thấp</li>
<li>Thịt cá <strong>trắng mịn</strong>, vị ngọt lành thanh tao, béo bùi nhẹ nhàng</li>
<li>Viền cá (engawa) — phần thịt ven vây cực kỳ quý, béo ngậy giòn sần sật</li>
<li>Phù hợp Sashimi, Sushi — nguyên liệu đỉnh cao trong ẩm thực Nhật</li>
<li>Giàu Protein chất lượng cao, Omega-3, Vitamin D, ít calo và cholesterol</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Sashimi (刺身)</strong> — Thái Usuzukuri (lát cực mỏng) thịt cá tươi, xếp hoa trên đĩa. Chấm ponzu trộn momiji-oroshi. Vị ngọt thanh mịn màng tuyệt hảo.</li>
<li><strong>Sushi Engawa</strong> — Thái phần viền cá (engawa), đặt lên nắm cơm sushi. Phết wasabi tươi. Béo ngậy giòn sần sật — phần sushi quý giá nhất.</li>
<li><strong>Cá bơn hấp xì dầu gừng</strong> — Hấp nguyên con 10-12 phút, tưới nước tương ngon và gừng thái sợi. Thịt cá trắng mịn ngọt lành.</li>
<li><strong>Áp chảo bơ chanh meunière</strong> — Phi lê cá, áp chảo vàng hai mặt với bơ Pháp. Tưới sốt bơ chanh (beurre meunière). Kinh điển ẩm thực Pháp.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Cá bơn sống nên chế biến trong vòng <strong>4-6 giờ</strong> để đạt chất lượng sashimi tối ưu.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Bọc kín màng thực phẩm, ngăn mát 0-2°C (ngăn lạnh nhất). Dùng trong 12-24 giờ.</li>
<li><strong>Cấp đông:</strong> Phi lê → bọc kín từng miếng → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng). Không phù hợp ăn sashimi sau rã đông.</li>
<li><strong>Lưu ý:</strong> Cá bơn vàng quý hiếm, ưu tiên ăn sashimi/sushi tươi sống để tận hưởng trọn vẹn giá trị.</li>
</ul>`
  },
  {
    slug: 'ca-bon-han-quoc',
    description: 'Cá Bơn Hàn Quốc nhập khẩu tươi sống bơi khỏe, đa dạng giống Bơn Nâu, Bơn Sao Safari, Bơn Trắng — thịt trắng mịn ngọt lành.',
    detailDescription: `<p><strong>Cá Bơn Hàn Quốc (Korean Flounder / Gwangeo)</strong> — loài cá bơn nổi tiếng trong ẩm thực Hàn Quốc, được nuôi trồng tại các trại cá biển chuẩn quốc tế. OCSEAFOOD cung cấp 3 dòng Cá Bơn Hàn Quốc:</p>
<h3>🟤 Bơn Nâu (Olive Flounder)</h3>
<ul>
<li>Giống phổ biến nhất, thịt trắng mịn, vị ngọt nhẹ thanh tao</li>
<li>Phù hợp sashimi và hoe (hòa - gỏi cá sống kiểu Hàn)</li>
</ul>
<h3>⭐ Bơn Sao Safari (Starry Flounder)</h3>
<ul>
<li>Giống quý hiếm hơn, da có đốm sao đẹp mắt</li>
<li>Thịt dày hơn, vị ngọt đậm đà hơn Bơn Nâu</li>
<li>Phù hợp nướng, hấp hoặc sashimi cao cấp</li>
</ul>
<h3>⚪ Bơn Trắng (White Flounder)</h3>
<ul>
<li>Giống hiếm nhất, thịt trắng tinh mịn màng</li>
<li>Vị ngọt thanh tinh khiết, texture mềm mịn</li>
<li>Dành cho ẩm thực cao cấp</li>
</ul>
<p>Tất cả đều giàu Protein, Omega-3, Vitamin D, ít calo — phù hợp người ăn kiêng.</p>`,
    cookingSuggestion: `<ul>
<li><strong>Hoe (회) — Gỏi cá sống Hàn Quốc</strong> — Phi lê cá, thái lát mỏng vừa. Cuốn cùng tía tô, tỏi lát, ớt sừng và chấm ssamjang hoặc cho-gochujang. Cách ăn cá bơn chuẩn Hàn Quốc.</li>
<li><strong>Sashimi kiểu Nhật</strong> — Thái Usuzukuri mỏng, chấm ponzu hoặc nước tương wasabi. Vị ngọt thanh tinh tế.</li>
<li><strong>Cá bơn hấp xì dầu</strong> — Hấp nguyên con 10-12 phút, tưới nước tương và hành gừng phi thơm. Đơn giản mà ngon.</li>
<li><strong>Cá bơn nướng muối kiểu Hàn</strong> — Ướp muối nhẹ, nướng trên bếp than. Ăn kèm rau sống, tương đậu doenjang. Thơm phức.</li>
<li><strong>Maeuntang (매운탕) — Canh cá cay Hàn Quốc</strong> — Nấu canh cay đặc trưng với ớt bột gochugaru, đậu phụ non, bí ngòi. Vị cay nồng hâm nóng cơ thể.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Cá bơn sống nên chế biến trong vòng <strong>4-6 giờ</strong> sau nhận hàng.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Bọc kín, ngăn mát 0-2°C. Dùng trong 12-24 giờ.</li>
<li><strong>Cấp đông:</strong> Phi lê → bọc kín → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Lưu ý:</strong> Cá bơn sống khỏe bơi mạnh. Khi mua về nên để trong bồn nước biển hoặc thùng xốp có sục oxy.</li>
</ul>`
  },
  {
    slug: 'ca-hoi',
    description: 'Cá Hồi Na Uy (Norwegian Salmon) nhập khẩu cao cấp, thịt cam hồng béo mướt — vua Sashimi giàu Omega-3, bổ dưỡng vượt trội.',
    detailDescription: `<p><strong>Cá Hồi Na Uy (Norwegian Salmon / Atlantic Salmon)</strong> — biểu tượng ẩm thực Bắc Âu và là loài cá được tiêu thụ nhiều nhất thế giới cho sashimi. OCSEAFOOD nhập khẩu cá hồi Na Uy nguyên con phi lê tươi, đảm bảo chuẩn sashimi-grade.</p>
<p>Na Uy là quốc gia hàng đầu thế giới về nuôi trồng cá hồi, với hệ thống kiểm soát chất lượng nghiêm ngặt từ trại nuôi đến bàn ăn.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Thịt cá <strong>cam hồng tươi sáng</strong>, vân mỡ trắng đều đặn — dấu hiệu cá hồi chất lượng cao</li>
<li>Vị béo mướt ngậy, ngọt nhẹ — tan trên đầu lưỡi khi ăn sashimi</li>
<li>Thịt mềm mịn, không tanh, hương thơm nhẹ nhàng dễ chịu</li>
<li><strong>Giàu Omega-3 (EPA &amp; DHA) bậc nhất</strong> — tốt cho tim mạch, não bộ, da và mắt</li>
<li>Giàu Protein, Vitamin D, Vitamin B12, Selen</li>
<li>Phù hợp mọi lứa tuổi, đặc biệt tốt cho trẻ em phát triển trí não và phụ nữ mang thai</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Sashimi</strong> — Thái lát dày 5-7mm theo thớ thịt, xếp đĩa trên nền đá lạnh. Chấm wasabi tươi + nước tương. Béo mướt tan trên đầu lưỡi.</li>
<li><strong>Cá hồi áp chảo da giòn</strong> — Phi lê cá giữ da, áp chảo mặt da trước với dầu ô liu lửa vừa cho da giòn rụm. Lật mặt thịt chín vừa (medium). Tưới sốt bơ chanh.</li>
<li><strong>Cá hồi nướng Teriyaki</strong> — Ướp sốt teriyaki 20 phút, nướng vỉ hoặc chảo vàng hai mặt. Ngọt mặn đậm đà kiểu Nhật.</li>
<li><strong>Poke Bowl</strong> — Cắt cá hồi tươi thành khối vuông, trộn cùng nước tương, dầu mè, hành lá. Xếp lên cơm trộn giấm cùng avocado, dưa leo, rong biển.</li>
<li><strong>Cá hồi hun khói</strong> — Ướp muối đường 24h → hun khói lạnh với gỗ sồi. Thái mỏng, ăn kèm bánh mì cream cheese. Khai vị sang trọng.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Sử dụng ngay:</strong> Cá hồi phi lê tươi nên dùng trong vòng <strong>24-48 giờ</strong> sau nhận hàng nếu bảo quản đúng cách.</li>
<li><strong>Bảo quản ngắn hạn:</strong> Bọc kín màng thực phẩm, đặt trong hộp kín ở ngăn mát <strong>0-2°C</strong> (ngăn lạnh nhất). Dùng trong 2-3 ngày.</li>
<li><strong>Cấp đông:</strong> Chia nhỏ theo phần ăn → bọc kín → cấp đông <strong>-18°C</strong> (giữ 2-3 tháng).</li>
<li><strong>Ăn sashimi:</strong> Chỉ ăn sashimi với cá hồi sashimi-grade trong vòng 24-48 giờ sau nhận hàng.</li>
<li><strong>Mẹo:</strong> Để cá hồi trên khay có lót giấy thấm hút ẩm để giữ thịt cá khô ráo, tránh nhớt.</li>
</ul>`
  },
  {
    slug: 'ca-trich-ep-trung',
    description: 'Cá Trích ép trứng (Kazunoko Komochi Nishin) chuẩn Sashimi Nhật Bản — thịt cá mềm ngọt hoà quyện trứng cá giòn lách tách đặc biệt.',
    detailDescription: `<p><strong>Cá Trích Ép Trứng (Kazunoko Komochi Nishin / 子持ちニシン)</strong> — đặc sản Nhật Bản độc đáo, là cá trích cái nguyên con được ép chặt cùng lớp trứng cá vàng ươm dày đặc. Sản phẩm đã qua sơ chế chuẩn sashimi-grade, sẵn sàng thưởng thức.</p>
<p>Trong ẩm thực Nhật, Kazunoko (trứng cá trích) là biểu tượng may mắn, thường xuất hiện trong mâm cỗ Osechi ngày Tết.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li><strong>Hai lớp kết hợp</strong> độc đáo: thịt cá trích mềm mịn + trứng cá vàng ươm giòn lách tách</li>
<li>Texture (kết cấu) <strong>giòn lách tách</strong> khi cắn vào trứng cá — cảm giác ăn cực kỳ thú vị</li>
<li>Vị ngọt nhẹ của thịt cá hoà quyện vị mặn béo của trứng — hài hoà tuyệt vời</li>
<li>Đã sơ chế sẵn chuẩn sashimi, thái ra là ăn được ngay</li>
<li>Giàu Omega-3 (cả DHA và EPA), Protein, Vitamin D và Canxi</li>
</ul>`,
    cookingSuggestion: `<ul>
<li><strong>Sashimi</strong> — Thái lát dày 8-10mm, xếp đĩa trên tía tô. Chấm nước tương wasabi. Thịt cá mềm ngọt, trứng giòn lách tách — texture tuyệt vời.</li>
<li><strong>Sushi nigiri</strong> — Thái miếng vừa, đặt lên nắm cơm sushi. Quấn thanh rong biển nori. Chấm nước tương nhẹ.</li>
<li><strong>Ăn kèm cơm nóng</strong> — Thái mỏng xếp lên cơm nóng, rắc mè rang và hành lá. Đơn giản nhưng ngon tuyệt.</li>
<li><strong>Tempura</strong> — Nhúng bột tempura Nhật, chiên giòn nhanh. Trứng cá bên trong nổ lách tách vui miệng. Chấm sốt tentsuyu.</li>
</ul>`,
    storageInstruction: `<ul>
<li><strong>Bảo quản:</strong> Sản phẩm đông lạnh, giữ trong tủ đông <strong>-18°C</strong>, hạn sử dụng theo bao bì.</li>
<li><strong>Rã đông:</strong> Chuyển sang ngăn mát 2-4°C trước <strong>6-8 giờ</strong>. Không ngâm trực tiếp trong nước.</li>
<li><strong>Sau rã đông:</strong> Dùng ngay trong vòng <strong>24 giờ</strong>. Tuyệt đối <strong>không tái đông</strong>.</li>
<li><strong>Mẹo:</strong> Để cá trích ép trứng hơi se lạnh (chưa rã đông hoàn toàn) khi thái sashimi — miếng cắt sẽ đẹp và gọn hơn.</li>
</ul>`
  }
];

async function main() {
  console.log('🌱 Starting product descriptions seed...');
  console.log(`📦 Total products to update: ${productDescriptions.length}`);

  let updated = 0;
  let skipped = 0;

  for (const prod of productDescriptions) {
    const existing = await prisma.product.findUnique({
      where: { slug: prod.slug }
    });

    if (!existing) {
      console.log(`⚠️ Product not found: ${prod.slug} — skipping`);
      skipped++;
      continue;
    }

    await prisma.product.update({
      where: { slug: prod.slug },
      data: {
        description: prod.description,
        detailDescription: prod.detailDescription,
        cookingSuggestion: prod.cookingSuggestion,
        storageInstruction: prod.storageInstruction
      }
    });

    updated++;
    console.log(`✅ Updated: ${existing.name} (${prod.slug})`);
  }

  console.log(`\n🎉 Seed completed! Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
