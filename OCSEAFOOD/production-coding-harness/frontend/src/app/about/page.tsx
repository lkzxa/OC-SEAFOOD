export default function AboutPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 space-y-16">
      {/* HEADER SECTION */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-100">
          Về <span className="text-orange-500">OCSEAFOOD</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Thương hiệu hải sản nhập khẩu và tươi sống cao cấp hàng đầu Việt Nam, mang tinh hoa ẩm thực đại dương tươi ngon nhất đến từng bàn ăn Việt.
        </p>
      </section>

      {/* STORY SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-navy-800 rounded-lg overflow-hidden border border-navy-700 p-6 md:p-10">
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-slate-100 tracking-tight flex items-center gap-3">
            <span className="w-1.5 h-7 bg-orange-500"></span> Câu Chuyện Thương Hiệu
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Được thành lập từ tình yêu sâu sắc với ẩm thực biển khơi và mong muốn nâng tầm bữa ăn gia đình Việt, OCSEAFOOD đã không ngừng nỗ lực tìm kiếm, liên kết với những ngư trường lớn nhất trên thế giới. 
          </p>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Chúng tôi tự hào mang đến các dòng sản phẩm hải sản nhập khẩu chất lượng Loại 1 như Cua hoàng đế King Crab, Tôm hùm Alaska, Bào ngư Hàn Quốc và Sashimi chuẩn Nhật. Mỗi sản phẩm tại OCSEAFOOD đều được sàng lọc khắt khe từ khâu đánh bắt, đóng gói, bảo quản nhiệt độ chuẩn quốc tế cho đến khâu giao tận tay khách hàng.
          </p>
        </div>
        <div className="aspect-video lg:aspect-square rounded-lg overflow-hidden bg-navy-900 border border-navy-700">
          <img
            alt="OCSEAFOOD Seafood Selection"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1534080391025-09795d197a5b?w=800"
          />
        </div>
      </section>

      {/* VISION - MISSION - CORE VALUES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 space-y-4">
          <span className="material-symbols-outlined text-4xl text-orange-500 select-none">visibility</span>
          <h3 className="text-lg font-black uppercase text-slate-100 tracking-wider">Tầm Nhìn</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Trở thành biểu tượng chất lượng số 1 trong ngành cung cấp hải sản cao cấp tại Việt Nam, mang các dòng sản phẩm đại dương quý hiếm nhất toàn cầu phục vụ thực khách Việt.
          </p>
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 space-y-4">
          <span className="material-symbols-outlined text-4xl text-orange-500 select-none">explore</span>
          <h3 className="text-lg font-black uppercase text-slate-100 tracking-wider">Sứ Mệnh</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Cam kết mang đến nguồn hải sản tươi sạch vượt trội, bảo toàn trọn vẹn hương vị tự nhiên và giá trị dinh dưỡng cao nhất để chăm sóc sức khỏe của mọi gia đình.
          </p>
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 space-y-4">
          <span className="material-symbols-outlined text-4xl text-orange-500 select-none">verified_user</span>
          <h3 className="text-lg font-black uppercase text-slate-100 tracking-wider">Giá Trị Cốt Lõi</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Chất lượng đặt hàng đầu, quy trình bảo quản tiêu chuẩn khắt khe, minh bạch thông tin nguồn gốc sản phẩm và đặt sự chu đáo phục vụ khách hàng làm tôn chỉ hoạt động.
          </p>
        </div>
      </section>

      {/* CONTACT INFO SECTION */}
      <section className="bg-navy-800 border border-navy-700 rounded-lg p-8 md:p-12 text-center max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-slate-100 tracking-tight">Liên Hệ Với Chúng Tôi</h2>
          <p className="text-slate-400 text-sm md:text-base">
            Mọi thắc mắc, yêu cầu tư vấn hoặc đặt hàng số lượng lớn cho nhà hàng, tiệc cưới xin vui lòng liên hệ:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
          <div className="flex gap-4 items-start bg-navy-900/50 p-5 rounded-lg border border-navy-700/50">
            <span className="material-symbols-outlined text-orange-500 text-2xl select-none pt-1">location_on</span>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase text-slate-400">Địa chỉ</h4>
              <p className="text-slate-200 text-xs md:text-sm font-semibold">123 Đường Hải Sản, Quận 1, TP. HCM</p>
            </div>
          </div>

          <div className="flex gap-4 items-start bg-navy-900/50 p-5 rounded-lg border border-navy-700/50">
            <span className="material-symbols-outlined text-orange-500 text-2xl select-none pt-1">phone_in_talk</span>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase text-slate-400">Hotline</h4>
              <p className="text-slate-200 text-xs md:text-sm font-semibold">1900 1234</p>
              <p className="text-[10px] text-slate-400">Hỗ trợ 24/7 từ 8h - 22h</p>
            </div>
          </div>

          <div className="flex gap-4 items-start bg-navy-900/50 p-5 rounded-lg border border-navy-700/50">
            <span className="material-symbols-outlined text-orange-500 text-2xl select-none pt-1">mail</span>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase text-slate-400">Email</h4>
              <p className="text-slate-200 text-xs md:text-sm font-semibold">contact@ocseafood.vn</p>
              <p className="text-[10px] text-slate-400">Phản hồi trong 24 giờ</p>
            </div>
          </div>
        </div>
      </section>

      {/* POLICIES SECTION */}
      <section className="space-y-12 pt-8 border-t border-navy-700">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-slate-100 tracking-tight">
            Chính Sách & Hướng Dẫn
          </h2>
          <p className="text-slate-400 text-sm">
            Thông tin chi tiết về chính sách hoạt động, mua hàng và cam kết dịch vụ của OCSEAFOOD.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chính sách đổi trả */}
          <div id="returns" className="bg-navy-800 border border-navy-700 rounded-lg p-6 space-y-4 scroll-mt-24 transition-all hover:border-orange-500/35">
            <h3 className="text-lg font-black uppercase text-slate-100 tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 select-none">assignment_return</span>
              Chính sách đổi trả
            </h3>
            <div className="text-slate-300 text-sm leading-relaxed space-y-2">
              <p>
                Nhằm bảo vệ quyền lợi người tiêu dùng và khẳng định chất lượng hải sản Loại 1, chúng tôi áp dụng chính sách đổi trả hàng linh hoạt:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Giao hàng lỗi/không đạt chuẩn:</strong> Hoàn tiền hoặc đổi sản phẩm mới trong vòng 2 giờ đối với hải sản tươi sống và 24 giờ đối với hải sản đông lạnh.</li>
                <li><strong>Yêu cầu đổi trả:</strong> Vui lòng chụp hình ảnh hoặc quay video sản phẩm lúc nhận hàng gửi qua Hotline/Zalo hỗ trợ của hệ thống.</li>
                <li><strong>Sản phẩm không đạt chuẩn:</strong> Chỉ chấp nhận hoàn trả sản phẩm còn giữ nguyên tem niêm phong hoặc bao bì gốc, không bị biến dạng do chế biến sai cách từ phía khách hàng.</li>
              </ul>
            </div>
          </div>

          {/* Chính sách bảo mật */}
          <div id="privacy" className="bg-navy-800 border border-navy-700 rounded-lg p-6 space-y-4 scroll-mt-24 transition-all hover:border-orange-500/35">
            <h3 className="text-lg font-black uppercase text-slate-100 tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 select-none">security</span>
              Chính sách bảo mật
            </h3>
            <div className="text-slate-300 text-sm leading-relaxed space-y-2">
              <p>
                Bảo vệ thông tin cá nhân của khách hàng là ưu tiên hàng đầu tại OCSEAFOOD. Chúng tôi cam kết:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Thu thập thông tin:</strong> Chỉ thu thập thông tin cơ bản phục vụ cho việc liên hệ đặt hàng, vận chuyển và gửi các voucher quà tặng khuyến mãi (bao gồm: Họ tên, Số điện thoại, Email, Địa chỉ).</li>
                <li><strong>Bảo mật lưu trữ:</strong> Dữ liệu được mã hóa truyền tải an toàn và bảo mật tuyệt đối trên hệ thống máy chủ, không chia sẻ với bên thứ ba cho mục đích thương mại ngoài việc phục vụ giao nhận hàng hóa.</li>
                <li><strong>Quyền của khách hàng:</strong> Bạn có quyền yêu cầu thay đổi hoặc xóa bỏ thông tin cá nhân trên hệ thống bất cứ lúc nào bằng cách liên hệ với quản trị viên.</li>
              </ul>
            </div>
          </div>

          {/* Hướng dẫn mua hàng */}
          <div id="guide" className="bg-navy-800 border border-navy-700 rounded-lg p-6 space-y-4 scroll-mt-24 transition-all hover:border-orange-500/35">
            <h3 className="text-lg font-black uppercase text-slate-100 tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 select-none">shopping_basket</span>
              Hướng dẫn mua hàng
            </h3>
            <div className="text-slate-300 text-sm leading-relaxed space-y-2">
              <p>
                Quy trình đặt mua hải sản cao cấp tại website vô cùng dễ dàng và thuận tiện:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Bước 1:</strong> Truy cập danh mục <strong>Menu</strong> hoặc <strong>Combo</strong>, lựa chọn các loại hải sản yêu thích và nhấp chọn <em>"Thêm vào giỏ"</em>.</li>
                <li><strong>Bước 2:</strong> Vào trang <strong>Giỏ hàng</strong> để kiểm tra lại số lượng, giá trị và cập nhật voucher giảm giá (nếu có).</li>
                <li><strong>Bước 3:</strong> Nhập đầy đủ thông tin giao hàng bao gồm: Họ tên, Số điện thoại và Địa chỉ chi tiết (3 cấp Tỉnh/Huyện/Xã).</li>
                <li><strong>Bước 4:</strong> Bấm nút <em>"Đặt hàng"</em> để gửi đơn hàng. Đơn hàng của bạn sẽ được đồng bộ và gửi thông báo trực tiếp qua Telegram/Zalo của Admin xử lý chuẩn bị giao hàng trong thời gian ngắn nhất.</li>
              </ol>
            </div>
          </div>

          {/* Vận chuyển & Giao nhận */}
          <div id="shipping" className="bg-navy-800 border border-navy-700 rounded-lg p-6 space-y-4 scroll-mt-24 transition-all hover:border-orange-500/35">
            <h3 className="text-lg font-black uppercase text-slate-100 tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 select-none">local_shipping</span>
              Vận chuyển & Giao nhận
            </h3>
            <div className="text-slate-300 text-sm leading-relaxed space-y-2">
              <p>
                Để bảo toàn độ tươi sống tuyệt hảo của hải sản, OCSEAFOOD áp dụng quy trình vận chuyển chuyên nghiệp:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Phương thức giao hàng:</strong> Sử dụng xe máy và ô tô chuyên dụng trang bị thùng giữ nhiệt lạnh chuẩn bảo quản thủy hải sản tươi sống.</li>
                <li><strong>Thời gian giao hàng:</strong> Giao hàng siêu tốc trong vòng 1-2 giờ kể từ khi xác nhận đơn hàng tại TP. Hồ Chí Minh.</li>
                <li><strong>Phí giao hàng:</strong> Phí ship được tính tự động dựa trên khoảng cách. Miễn phí vận chuyển đối với các đơn hàng hải sản đạt giá trị từ 1,500,000đ trở lên.</li>
                <li><strong>Nhận hàng kiểm tra:</strong> Khách hàng có quyền mở kiểm tra độ sống/tươi ngon của sản phẩm trước khi tiến hành thanh toán cho nhân viên giao hàng.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
