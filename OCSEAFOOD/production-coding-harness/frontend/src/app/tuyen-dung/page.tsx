"use client";

import { useState } from "react";

interface JobOpening {
  id: string;
  title: string;
  quantity: number;
  salary: string;
  location: string;
  description: string;
  requirements: string[];
}

const JOB_OPENINGS: JobOpening[] = [
  {
    id: "sale",
    title: "Nhân viên Tư vấn bán hàng (Online / Showroom)",
    quantity: 3,
    salary: "8.000.000 - 15.000.000 VND (Lương cứng + Hoa hồng)",
    location: "Quận 1, TP. Hồ Chí Minh",
    description: "Tư vấn, chăm sóc khách hàng trực tuyến, chốt đơn hải sản trên website, Zalo OA và Fanpage chính thức của OCSEAFOOD.",
    requirements: [
      "Có kỹ năng giao tiếp tốt, giọng nói dễ nghe, nhẹ nhàng.",
      "Ưu tiên ứng viên có kinh nghiệm tư vấn bán hàng online hoặc ngành F&B.",
      "Nhanh nhẹn, trung thực, có tinh thần trách nhiệm cao."
    ]
  },
  {
    id: "chef",
    title: "Nhân viên Sơ chế & Chế biến hải sản",
    quantity: 2,
    salary: "9.000.000 - 12.000.000 VND (Hỗ trợ cơm trưa)",
    location: "Showroom Quận 1, TP. Hồ Chí Minh",
    description: "Thực hiện sơ chế các loại cua, tôm hùm, cá tươi sống theo yêu cầu của khách hàng và chế biến sashimi chuẩn Nhật dưới sự hướng dẫn của Bếp trưởng.",
    requirements: [
      "Có kinh nghiệm sơ chế hoặc chế biến hải sản tươi sống từ 1 năm trở lên.",
      "Nắm vững các nguyên tắc vệ sinh an toàn thực phẩm.",
      "Chịu khó, tỉ mỉ, có khả năng làm việc dưới áp lực cao."
    ]
  },
  {
    id: "shipper",
    title: "Nhân viên Giao hàng siêu tốc (Shipper)",
    quantity: 5,
    salary: "10.000.000 - 14.000.000 VND (Hỗ trợ xăng xe)",
    location: "Khu vực nội thành TP. Hồ Chí Minh",
    description: "Vận chuyển hải sản tươi sống bằng thùng giữ nhiệt lạnh chuyên dụng của cửa hàng đến tận tay khách hàng trong vòng 1-2 giờ.",
    requirements: [
      "Có xe máy cá nhân và điện thoại thông minh.",
      "Thông thạo đường phố khu vực TP. Hồ Chí Minh.",
      "Thái độ phục vụ khách hàng lịch sự, thân thiện, cẩn thận."
    ]
  }
];

export default function RecruitmentPage() {
  // Application Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [intro, setIntro] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName || !phone || !email || !position) {
      setErrorMsg("Vui lòng điền đầy đủ các thông tin bắt buộc (*).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Định dạng email không hợp lệ.");
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, "");
    const phoneRegex = /^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMsg("Số điện thoại không đúng định dạng Việt Nam.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phone: cleanPhone,
          email,
          position,
          intro: intro || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error?.message || "Nộp hồ sơ thất bại. Vui lòng thử lại.");
      }

      setSuccess(true);
      // Reset form fields
      setFullName("");
      setPhone("");
      setEmail("");
      setPosition("");
      setIntro("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Nộp hồ sơ thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 space-y-16">
      
      {/* HERO SECTION */}
      <section className="relative rounded-2xl overflow-hidden border border-navy-700 bg-navy-800 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 md:p-12 z-10 relative">
          <div className="space-y-6">
            <span className="inline-block bg-orange-500/10 text-orange-500 text-xs font-black px-3 py-1.5 rounded-full border border-orange-500/20 uppercase tracking-widest">
              Cơ hội nghề nghiệp
            </span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-100 leading-tight">
              Gia Nhập Đội Ngũ <br />
              <span className="text-orange-500">OCSEAFOOD</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Chúng tôi luôn tìm kiếm những cộng sự tài năng, nhiệt huyết và có chung niềm đam mê với ẩm thực đại dương cao cấp. Tại OCSEAFOOD, bạn sẽ được làm việc trong môi trường chuyên nghiệp, năng động và có lộ trình thăng tiến rộng mở.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#jobs"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20"
              >
                Xem vị trí tuyển dụng
              </a>
              <a
                href="#apply"
                className="bg-navy-900/60 hover:bg-navy-950 border border-navy-700 text-slate-200 font-bold text-xs uppercase px-6 py-3.5 rounded-xl transition-all"
              >
                Ứng tuyển ngay
              </a>
            </div>
          </div>
          <div className="aspect-video lg:aspect-[4/3] rounded-xl overflow-hidden border border-navy-700 shadow-inner">
            <img
              alt="OCSEAFOOD Recruitment Banner"
              className="w-full h-full object-cover select-none"
              src="/recruitment_banner.png"
            />
          </div>
        </div>
      </section>

      {/* WORK ENVIRONMENT & BENEFITS */}
      <section className="space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-slate-100 tracking-tight">
            Quyền Lợi & Môi Trường Làm Việc
          </h2>
          <p className="text-slate-400 text-sm">
            OCSEAFOOD nỗ lực kiến tạo một nơi làm việc lý tưởng để mỗi cá nhân đều có thể phát triển tối đa tiềm năng bản thân.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-navy-800 border border-navy-700/60 rounded-xl p-6 space-y-4 hover:border-orange-500/30 transition-all">
            <span className="material-symbols-outlined text-4xl text-orange-500 select-none">payments</span>
            <h3 className="text-sm font-black uppercase text-slate-100 tracking-wider">Thu Nhập Hấp Dẫn</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Mức lương cứng cạnh tranh kèm theo chính sách thưởng doanh thu/chốt đơn đột phá không giới hạn năng lực.
            </p>
          </div>

          <div className="bg-navy-800 border border-navy-700/60 rounded-xl p-6 space-y-4 hover:border-orange-500/30 transition-all">
            <span className="material-symbols-outlined text-4xl text-orange-500 select-none">diversity_3</span>
            <h3 className="text-sm font-black uppercase text-slate-100 tracking-wider">Môi Trường Thân Thiện</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Đồng nghiệp trẻ trung, hòa đồng, năng động. Tinh thần đồng đội cao và luôn sẵn sàng hỗ trợ giúp đỡ lẫn nhau.
            </p>
          </div>

          <div className="bg-navy-800 border border-navy-700/60 rounded-xl p-6 space-y-4 hover:border-orange-500/30 transition-all">
            <span className="material-symbols-outlined text-4xl text-orange-500 select-none">school</span>
            <h3 className="text-sm font-black uppercase text-slate-100 tracking-wider">Đào Tạo Bài Bản</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Được hướng dẫn chi tiết về quy chuẩn hải sản cao cấp Loại 1, kiến thức ẩm thực và kỹ năng nghiệp vụ chuyên sâu.
            </p>
          </div>

          <div className="bg-navy-800 border border-navy-700/60 rounded-xl p-6 space-y-4 hover:border-orange-500/30 transition-all">
            <span className="material-symbols-outlined text-4xl text-orange-500 select-none">trending_up</span>
            <h3 className="text-sm font-black uppercase text-slate-100 tracking-wider">Lộ Trình Thăng Tiến</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Đánh giá định kỳ rõ ràng để thăng tiến lên các vị trí Quản lý Cửa hàng, Quản lý Nhóm Tư vấn hoặc Bếp trưởng.
            </p>
          </div>
        </div>
      </section>

      {/* JOB OPENINGS LIST */}
      <section id="jobs" className="space-y-8 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-slate-100 tracking-tight">
            Vị Trí Đang Tuyển Dụng
          </h2>
          <p className="text-slate-400 text-sm">
            Lựa chọn vị trí phù hợp với năng lực và định hướng phát triển của bạn.
          </p>
        </div>

        <div className="space-y-6">
          {JOB_OPENINGS.map((job) => (
            <div
              key={job.id}
              className="bg-navy-800 border border-navy-700 rounded-xl p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center hover:border-orange-500/20 transition-all"
            >
              <div className="space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg md:text-xl font-black text-slate-100 tracking-tight leading-tight">
                    {job.title}
                  </h3>
                  <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold px-2 py-0.5 rounded">
                    Số lượng: {job.quantity} người
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500 text-sm select-none">payments</span>
                    <span><strong>Thu nhập:</strong> {job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500 text-sm select-none">location_on</span>
                    <span><strong>Địa điểm:</strong> {job.location}</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                  {job.description}
                </p>
                <div className="space-y-1.5">
                  <p className="text-slate-300 text-xs font-black uppercase tracking-wider">Yêu cầu công việc:</p>
                  <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
                    {job.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="w-full lg:w-auto pt-4 lg:pt-0">
                <a
                  href="#apply"
                  onClick={() => setPosition(job.title)}
                  className="block lg:inline-block w-full lg:w-auto text-center bg-navy-900 hover:bg-navy-950 border border-navy-700 text-orange-500 hover:text-orange-400 font-bold text-xs uppercase px-6 py-3 rounded-lg transition-all"
                >
                  Nộp Đơn
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK APPLICATION FORM */}
      <section id="apply" className="scroll-mt-24 max-w-2xl mx-auto">
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-6 md:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-black uppercase text-slate-100 tracking-tight">
              Ứng Tuyển Nhanh
            </h2>
            <p className="text-slate-400 text-xs md:text-sm">
              Để lại thông tin liên hệ và vị trí mong muốn, phòng nhân sự sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
          </div>

          {success ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-4">
              <span className="material-symbols-outlined text-4xl text-green-400 select-none">check_circle</span>
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-100 uppercase">Ứng Tuyển Thành Công!</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Cảm ơn bạn đã nộp hồ sơ ứng tuyển vào đội ngũ OCSEAFOOD. Phòng Nhân sự đã nhận được thông tin đăng ký của bạn và sẽ chủ động gọi điện liên hệ trao đổi chi tiết phỏng vấn trong vòng 24 - 48 giờ làm việc.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-2 text-xs font-bold text-orange-500 hover:underline uppercase"
              >
                Nộp thêm hồ sơ khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Full name input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center bg-navy-900 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 select-none text-xl">person</span>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Contact info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center bg-navy-900 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 select-none text-xl">call</span>
                    <input
                      type="tel"
                      placeholder="0912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Email address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Địa chỉ Email <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center bg-navy-900 border border-navy-700/60 rounded-xl px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 select-none text-xl">mail</span>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent border-none text-slate-200 text-sm w-full py-2 ml-3 focus:outline-none focus:ring-0"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Position selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Vị trí ứng tuyển <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center bg-navy-900 border border-navy-700/60 rounded-xl px-4 py-2.5 focus-within:border-orange-500 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 select-none text-xl mr-3">work</span>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="bg-transparent border-none text-slate-200 text-sm w-full focus:outline-none focus:ring-0"
                    disabled={loading}
                    required
                  >
                    <option value="" className="bg-navy-900 text-slate-300">-- Lựa chọn vị trí tuyển dụng --</option>
                    {JOB_OPENINGS.map((job) => (
                      <option key={job.id} value={job.title} className="bg-navy-900 text-slate-300">
                        {job.title}
                      </option>
                    ))}
                    <option value="Khác" className="bg-navy-900 text-slate-300">Vị trí khác / Hồ sơ tự do</option>
                  </select>
                </div>
              </div>

              {/* Brief Introduction / CV Link */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Giới thiệu bản thân & Link CV (nếu có)
                </label>
                <div className="bg-navy-900 border border-navy-700/60 rounded-xl px-4 py-2 focus-within:border-orange-500 transition-colors">
                  <textarea
                    rows={4}
                    placeholder="Mô tả ngắn gọn về kinh nghiệm của bạn hoặc đính kèm link Drive CV..."
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                    className="bg-transparent border-none text-slate-200 text-sm w-full focus:outline-none focus:ring-0 resize-none"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-black text-xs uppercase py-4 rounded-xl transition-colors tracking-widest shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                {loading ? "Đang gửi hồ sơ..." : "Nộp Hồ Sơ Ứng Tuyển"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
