import React from "react";

const ContractTemplate = React.forwardRef(
  ({ contractData, signature }, ref) => {
    const {
      id,
      fullName,
      phoneNumber,
      permanentAddress,
      identityCardNumber,
      identityCardDate,
      identityCardPlace,
      startDate,
      endDate,
      commissionPercentage,
      contractType,
      createdAt,
      taxCode,
      contactEmail,
      extraRules,
    } = contractData;

    // Format date helper
    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    };

    // Render template for GymOwner
    if (contractType === "GymOwner") {
      return (
        <div
          ref={ref}
          className="max-w-[210mm] min-h-[297mm] p-[20mm] mx-auto bg-white shadow-lg font-serif text-black leading-relaxed"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <p className="text-sm font-bold mb-1">
              Số: {id?.substring(0, 15).toUpperCase()}-GO
            </p>
            <p className="text-sm mb-1">
              Ngày: {formatDate(createdAt || new Date())}
            </p>
            <p className="text-sm">
              Địa điểm ký kết: 7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, TP. Hồ Chí Minh
            </p>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-base font-bold mb-2 uppercase">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </h2>
            <h3 className="text-sm font-bold italic">
              Độc lập - Tự do - Hạnh phúc
            </h3>
          </div>

          <h1 className="text-xl font-bold text-center mb-6 uppercase">
            HỢP ĐỒNG HỢP TÁC - DÀNH CHO GYM OWNER
          </h1>

          <p className="text-sm mb-4">Chúng tôi, gồm các bên:</p>

          {/* BÊN A */}
          <section className="mb-6">
            <h2 className="text-base font-bold mb-3 uppercase">
              BÊN A: NỀN TẢNG FITBRIDGE (FITBRIDGE PLATFORM)
            </h2>
            <div className="text-sm space-y-1">
              <p>
                <strong>Tên Công ty:</strong> FitBridge Platform Co., Ltd
              </p>
              <p>
                <strong>Địa chỉ Trụ sở chính:</strong> 7 Đ. D1, Long Thạnh Mỹ,
                Thủ Đức, Thành phố Hồ Chí Minh 700000
              </p>
              <p>
                <strong>Mã số thuế:</strong> [Mã số thuế của FitBridge]
              </p>
              <p>
                <strong>Đại diện bởi:</strong> Lâm Quốc Phong
              </p>
              <p>
                <strong>Chức vụ:</strong> Admin
              </p>
              <p>
                <strong>Số CCCD:</strong> 077204000387
              </p>
              <p>
                <strong>Ngày cấp:</strong> ___________________
              </p>
              <p>
                <strong>Nơi cấp:</strong> ___________________
              </p>
              <p>
                <strong>Điện thoại:</strong> 0973035305
              </p>
              <p>
                <strong>Email:</strong> admin@fitbridge.vn
              </p>
            </div>
          </section>

          {/* BÊN B */}
          <section className="mb-6">
            <h2 className="text-base font-bold mb-3 uppercase">
              BÊN B: PHÒNG TẬP (GYM OWNER)
            </h2>
            <div className="text-sm space-y-1">
              <p>
                <strong>Tên Doanh nghiệp/Hộ Kinh doanh:</strong> {fullName}
              </p>
              <p>
                <strong>Loại hình đối tác:</strong> Gym Owner
              </p>
              <p>
                <strong>Mã số thuế:</strong> {taxCode || "___________________"}
              </p>
              <p>
                <strong>Chủ sở hữu/Người đại diện:</strong> {fullName}
              </p>
              <p>
                <strong>Địa chỉ kinh doanh:</strong> {permanentAddress}
              </p>
              <p>
                <strong>Email liên hệ:</strong>{" "}
                {contactEmail || "___________________"}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {phoneNumber}
              </p>
              <p>
                <strong>Số CCCD:</strong>{" "}
                {identityCardNumber || "___________________"}
              </p>
              <p>
                <strong>Ngày cấp:</strong>{" "}
                {formatDate(identityCardDate) || "___________________"}
              </p>
              <p>
                <strong>Nơi cấp:</strong>{" "}
                {identityCardPlace || "___________________"}
              </p>
            </div>
          </section>

          <p className="text-sm mb-6 italic">
            (Sau đây, Bên A và Bên B được gọi chung là Các Bên)
          </p>

          {/* ĐIỀU 1 */}
          <section className="mb-6">
            <h2 className="text-base font-bold mb-3 uppercase text-center">
              ĐIỀU 1: NỘI DUNG VÀ MỤC ĐÍCH HỢP ĐỒNG
            </h2>
            <div className="text-sm text-justify space-y-2">
              <p>
                <strong>1.1. Mục đích:</strong> Bên A đồng ý cho Bên B sử dụng
                nền tảng công nghệ FitBridge để quản lý và kinh doanh dịch vụ
                phòng tập và các khóa học cho Khách hàng cuối.
              </p>
              <p>
                <strong>1.2. Cam kết:</strong> Bên B cam kết tuân thủ các điều
                khoản và điều kiện, bao gồm các Quy định vận hành, Chính sách
                chất lượng dịch vụ, và Quy trình thanh toán do Bên A ban hành.
              </p>
            </div>
          </section>

          {/* ĐIỀU 2 */}
          <section className="mb-6">
            <h2 className="text-base font-bold mb-3 uppercase text-center">
              ĐIỀU 2: THỜI HẠN HỢP ĐỒNG
            </h2>
            <div className="text-sm text-justify space-y-2">
              <p>
                <strong>2.1.</strong> Hợp đồng này có hiệu lực kể từ ngày ký và
                có hiệu lực từ ngày <strong>{formatDate(startDate)}</strong> đến
                hết ngày <strong>{formatDate(endDate)}</strong>.
              </p>
              <p>
                <strong>2.2.</strong> Khi hợp đồng chấm dứt tài khoản bên B sẽ
                không thể sử dụng tài khoản đối với các tính năng liên quan đến
                quản lý khóa học và tương tác với khách hàng, cho đến khi ký kết
                hợp đồng mới, trường hợp bên B cần tương tác với khách hàng để
                hoàn thành khóa học, cần liên hệ nhân viên tư vấn để hỗ trợ mở
                tài khoản.
              </p>
            </div>
          </section>

          {/* ĐIỀU 3 */}
          <section className="mb-6">
            <h2 className="text-base font-bold mb-3 uppercase text-center">
              ĐIỀU 3: PHÍ DỊCH VỤ VÀ QUY TRÌNH THANH TOÁN (ORDER & WALLET)
            </h2>
            <div className="text-sm text-justify space-y-2">
              <p>
                <strong>3.1. Phí Dịch vụ (Commission Fee):</strong> Bên B cam
                kết thanh toán cho Bên A phí dịch vụ là{" "}
                <strong>{commissionPercentage}%</strong> trên mỗi giao dịch
                thành công (bao gồm Gym Course và Subscription Plans Order) được
                thực hiện qua nền tảng FitBridge.
              </p>
              <p>
                <strong>
                  3.2. Quy trình Giao dịch và Đối soát (Profit Distribution):
                </strong>
              </p>
              <ul className="list-disc pl-8 space-y-1">
                <li>
                  <strong>Giao dịch:</strong> Toàn bộ doanh thu từ các Order của
                  Khách hàng sẽ được chuyển vào tài khoản trung gian của
                  FitBridge.
                </li>
                <li>
                  <strong>Đối soát:</strong> Sau khi Khách hàng hoàn tất thanh
                  toán thành công, phần lợi nhuận (sau khi trừ{" "}
                  {commissionPercentage}% phí dịch vụ) sẽ được ghi nhận vào số
                  dư chờ thanh toán của Bên B.
                </li>
                <li>
                  <strong>Chuyển đổi:</strong> Bên A sẽ thực hiện chuyển tiền từ
                  số dư chờ thanh toán sang số dư khả dụng của Bên B sau 30 ngày
                  kể từ ngày Khách hàng hoàn tất thanh toán khóa học.
                </li>
              </ul>
              <p>
                <strong>3.3. Quy trình Rút tiền (Withdrawal):</strong>
              </p>
              <ul className="list-disc pl-8 space-y-1">
                <li>
                  Bên B chỉ có thể thực hiện yêu cầu rút tiền đối với số dư khả
                  dụng trong ví.
                </li>
                <li>
                  Bên B phải cung cấp đầy đủ và chính xác thông tin ngân hàng.
                </li>
                <li>
                  Bên A cam kết xử lý yêu cầu rút tiền trong vòng 7 ngày làm
                  việc kể từ khi nhận được yêu cầu hợp lệ.
                </li>
              </ul>
              <p>
                <strong>
                  3.4. Xử lý Hoàn tiền/Khiếu nại (Refund/ReportCases):
                </strong>{" "}
                Trong trường hợp Khách hàng được hoàn tiền hoặc phát sinh khiếu
                nại (ReportCases) dẫn đến việc phải hoàn tiền, Bên B có trách
                nhiệm hoàn trả lại phần lợi nhuận đã nhận và/hoặc FitBridge có
                quyền thu hồi khoản phí dịch vụ đã chi trả.
              </p>
            </div>
          </section>

          {/* ĐIỀU 4 */}
          <section className="mb-6">
            <h2 className="text-base font-bold mb-3 uppercase text-center">
              ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN
            </h2>
            <div className="text-sm text-justify space-y-2">
              <p>
                <strong>
                  4.1. Quyền và Nghĩa vụ của Bên A (FITBRIDGE PLATFORM):
                </strong>
              </p>
              <ul className="list-disc pl-8 space-y-1">
                <li>
                  Cung cấp nền tảng công nghệ để Bên B quản lý kinh doanh.
                </li>
                <li>
                  Hỗ trợ kỹ thuật và tư vấn cho Bên B trong quá trình sử dụng
                  nền tảng.
                </li>
                <li>
                  Đảm bảo an toàn thông tin và dữ liệu kinh doanh của Bên B theo
                  chính sách bảo mật của nền tảng.
                </li>
                <li>Thu phí dịch vụ theo thỏa thuận tại Điều 3.</li>
              </ul>
              <p>
                <strong>4.2. Quyền và Nghĩa vụ của Bên B (PHÒNG TẬP):</strong>
              </p>
              <ul className="list-disc pl-8 space-y-1">
                <li>
                  Sử dụng nền tảng FitBridge để quản lý và kinh doanh dịch vụ.
                </li>
                <li>
                  Cung cấp thông tin chính xác, đầy đủ về cơ sở vật chất, khóa
                  học, và thông tin pháp lý.
                </li>
                <li>
                  Tuân thủ các quy định vận hành và tiêu chuẩn chất lượng dịch
                  vụ của nền tảng.
                </li>
                <li>
                  Thanh toán phí dịch vụ cho Bên A đúng hạn và theo Điều 3.
                </li>
                <li>
                  Đảm bảo chất lượng dịch vụ và an toàn cho khách hàng theo mô
                  tả đã đăng tải.
                </li>
              </ul>
            </div>
          </section>

          {/* ĐIỀU 5 */}
          <section className="mb-6">
            <h2 className="text-base font-bold mb-3 uppercase text-center">
              ĐIỀU 5: CÁC ĐIỀU KHOẢN BỔ SUNG VÀ ĐIỀU KIỆN
            </h2>
            <div className="text-sm text-justify space-y-2">
              <p>
                <strong>5.1. Chất lượng dịch vụ:</strong> Bên B cam kết duy trì
                đánh giá tốt trên 4 sao và giải quyết khiếu nại. Nếu vi phạm,
                Bên A có quyền đình chỉ dịch vụ.
              </p>
              <p>
                <strong>5.2. Bảo mật:</strong> Bên B cam kết bảo mật thông tin
                Khách hàng.
              </p>
              <p>
                <strong>5.3. Chấm dứt Hợp đồng sớm:</strong> Quy định chấm dứt
                khi vi phạm cơ bản mà không khắc phục sau 15 ngày.
              </p>
              <p>
                <strong>5.4.</strong> Bên B có trách nhiệm thông báo bằng văn
                bản cho Bên A trước ít nhất 15 ngày trước khi thay đổi địa điểm
                kinh doanh.
              </p>
              {extraRules && extraRules.length > 0 && (
                <div className="mt-3">
                  <p>
                    <strong>5.5. Các điều khoản bổ sung:</strong>
                  </p>
                  <ul className="list-disc pl-8 space-y-1">
                    {extraRules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* ĐIỀU 6 */}
          <section className="mb-8">
            <h2 className="text-base font-bold mb-3 uppercase text-center">
              ĐIỀU 6: ĐIỀU KHOẢN CHUNG
            </h2>
            <div className="text-sm text-justify space-y-2">
              <p>
                <strong>6.1.</strong> Hợp đồng này có hiệu lực kể từ ngày ký.
              </p>
              <p>
                <strong>6.2.</strong> Mọi tranh chấp phát sinh sẽ được giải
                quyết qua thương lượng hoặc Tòa án tại TP.HCM.
              </p>
              <p>
                <strong>6.3.</strong> Hợp đồng được lập thành 02 bản có giá trị
                pháp lý như nhau, mỗi bên giữ 01 bản.
              </p>
            </div>
          </section>

          {/* Signatures */}
          <section className="flex justify-between mt-12 pt-8 border-t border-gray-300">
            <div className="w-[45%] text-center">
              <h3 className="text-sm font-bold mb-1">ĐẠI DIỆN BÊN A</h3>
              <p className="text-xs italic my-1">(Ký và ghi rõ họ tên)</p>
              <div className="min-h-[100px] flex items-center justify-center my-5">
                {contractData.companySignatureUrl ? (
                  <img
                    src={contractData.companySignatureUrl}
                    alt="Company Signature"
                    className="max-w-[200px] max-h-[100px] object-contain"
                  />
                ) : (
                  <p className="text-gray-400">[Chữ ký Admin]</p>
                )}
              </div>
              <p className="font-bold mt-2.5">Lâm Quốc Phong</p>
            </div>

            <div className="w-[45%] text-center">
              <h3 className="text-sm font-bold mb-1">ĐẠI DIỆN BÊN B</h3>
              <p className="text-xs italic my-1">(Ký và ghi rõ họ tên)</p>
              <div className="min-h-[100px] flex items-center justify-center my-5">
                {signature || contractData.customerSignatureUrl ? (
                  <img
                    src={signature || contractData.customerSignatureUrl}
                    alt="Customer Signature"
                    className="max-w-[200px] max-h-[100px] object-contain"
                  />
                ) : (
                  <p className="text-gray-400">[Chữ ký chủ phòng tập]</p>
                )}
              </div>
              <p className="font-bold mt-2.5">{fullName}</p>
            </div>
          </section>
        </div>
      );
    }

    // Render template for FreelancePT
    return (
      <div
        ref={ref}
        className="max-w-[210mm] min-h-[297mm] p-[20mm] mx-auto bg-white shadow-lg font-serif text-black leading-relaxed"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-sm font-bold mb-1">
            Số: {id?.substring(0, 15).toUpperCase()}-FPT
          </p>
          <p className="text-sm mb-1">
            Ngày: {formatDate(createdAt || new Date())}
          </p>
          <p className="text-sm">
            Địa điểm ký kết: 7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, TP. Hồ Chí Minh
          </p>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-base font-bold mb-2 uppercase">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </h2>
          <h3 className="text-sm font-bold italic">
            Độc lập - Tự do - Hạnh phúc
          </h3>
        </div>

        <h1 className="text-xl font-bold text-center mb-6 uppercase">
          HỢP ĐỒNG HỢP TÁC - DÀNH CHO FREELANCE PT
        </h1>

        <p className="text-sm mb-4">Chúng tôi, gồm các bên:</p>

        {/* BÊN A */}
        <section className="mb-6">
          <h2 className="text-base font-bold mb-3 uppercase">
            BÊN A: NỀN TẢNG FITBRIDGE (FITBRIDGE PLATFORM)
          </h2>
          <div className="text-sm space-y-1">
            <p>
              <strong>Tên Công ty:</strong> FitBridge Platform Co., Ltd
            </p>
            <p>
              <strong>Địa chỉ Trụ sở chính:</strong> 7 Đ. D1, Long Thạnh Mỹ, Thủ
              Đức, Thành phố Hồ Chí Minh 700000
            </p>
            <p>
              <strong>Mã số thuế:</strong> [Mã số thuế của FitBridge]
            </p>
            <p>
              <strong>Đại diện bởi:</strong> Lâm Quốc Phong
            </p>
            <p>
              <strong>Chức vụ:</strong> Admin
            </p>
            <p>
              <strong>Số CCCD:</strong> 077204000387
            </p>
            <p>
              <strong>Ngày cấp:</strong> ___________________
            </p>
            <p>
              <strong>Nơi cấp:</strong> ___________________
            </p>
            <p>
              <strong>Địa chỉ thường trú:</strong> 7 Đ. D1, Long Thạnh Mỹ, Thủ
              Đức, TP.HCM
            </p>
            <p>
              <strong>Điện thoại:</strong> 0973035305
            </p>
            <p>
              <strong>Email:</strong> admin@fitbridge.vn
            </p>
          </div>
        </section>

        {/* BÊN B */}
        <section className="mb-6">
          <h2 className="text-base font-bold mb-3 uppercase">
            BÊN B: HUẤN LUYỆN VIÊN CÁ NHÂN TỰ DO (FREELANCE PT)
          </h2>
          <div className="text-sm space-y-1">
            <p>
              <strong>Tên Cá nhân/Hộ Kinh doanh:</strong> {fullName}
            </p>
            <p>
              <strong>Loại hình đối tác:</strong> Freelance PT
            </p>
            <p>
              <strong>Mã số thuế:</strong> {taxCode || "___________________"}
            </p>
            <p>
              <strong>Địa chỉ liên hệ:</strong> {permanentAddress}
            </p>
            <p>
              <strong>Số CCCD:</strong>{" "}
              {identityCardNumber || "___________________"}
            </p>
            <p>
              <strong>Ngày cấp:</strong>{" "}
              {formatDate(identityCardDate) || "___________________"}
            </p>
            <p>
              <strong>Nơi cấp:</strong>{" "}
              {identityCardPlace || "___________________"}
            </p>
            <p>
              <strong>Email liên hệ:</strong>{" "}
              {contactEmail || "___________________"}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {phoneNumber}
            </p>
          </div>
        </section>

        <p className="text-sm mb-6 italic">
          (Sau đây, Bên A và Bên B được gọi chung là Các Bên)
        </p>

        {/* ĐIỀU 1 */}
        <section className="mb-6">
          <h2 className="text-base font-bold mb-3 uppercase text-center">
            ĐIỀU 1: NỘI DUNG VÀ MỤC ĐÍCH HỢP ĐỒNG
          </h2>
          <div className="text-sm text-justify space-y-2">
            <p>
              <strong>1.1. Mục đích:</strong> Bên A đồng ý cho Bên B sử dụng nền
              tảng công nghệ FitBridge để quản lý và kinh doanh các gói đào tạo
              cá nhân (FreelancePTPackage) cho Khách hàng cuối.
            </p>
            <p>
              <strong>1.2. Cam kết:</strong> Bên B cam kết tuân thủ các điều
              khoản và điều kiện, bao gồm các Quy định vận hành, Chính sách chất
              lượng dịch vụ, và Quy trình thanh toán do Bên A ban hành.
            </p>
          </div>
        </section>

        {/* ĐIỀU 2 */}
        <section className="mb-6">
          <h2 className="text-base font-bold mb-3 uppercase text-center">
            ĐIỀU 2: THỜI HẠN HỢP ĐỒNG
          </h2>
          <div className="text-sm text-justify space-y-2">
            <p>
              <strong>2.1.</strong> Hợp đồng này có hiệu lực kể từ ngày ký và có
              hiệu lực từ ngày <strong>{formatDate(startDate)}</strong> đến hết
              ngày <strong>{formatDate(endDate)}</strong>.
            </p>
            <p>
              <strong>2.2.</strong> Khi hợp đồng chấm dứt tài khoản bên B sẽ
              không thể sử dụng tài khoản đối với các tính năng liên quan đến
              quản lý khóa học và tương tác với khách hàng, cho đến khi ký kết
              hợp đồng mới, trường hợp bên B cần tương tác với khách hàng để
              hoàn thành khóa học, cần liên hệ nhân viên tư vấn để hỗ trợ mở tài
              khoản.
            </p>
          </div>
        </section>

        {/* ĐIỀU 3 */}
        <section className="mb-6">
          <h2 className="text-base font-bold mb-3 uppercase text-center">
            ĐIỀU 3: PHÍ DỊCH VỤ VÀ QUY TRÌNH THANH TOÁN (ORDER & WALLET)
          </h2>
          <div className="text-sm text-justify space-y-2">
            <p>
              <strong>3.1. Phí Dịch vụ (Commission Fee):</strong> Bên B cam kết
              thanh toán cho Bên A phí dịch vụ là{" "}
              <strong>{commissionPercentage}%</strong> trên mỗi giao dịch thành
              công được thực hiện qua nền tảng FitBridge.
            </p>
            <p>
              <strong>
                3.2. Quy trình Giao dịch và Đối soát (Profit Distribution):
              </strong>
            </p>
            <ul className="list-disc pl-8 space-y-1">
              <li>
                <strong>Giao dịch:</strong> Toàn bộ doanh thu từ các Order của
                Khách hàng sẽ được chuyển vào tài khoản trung gian của
                FitBridge.
              </li>
              <li>
                <strong>Đối soát:</strong> Sau khi Khách hàng hoàn tất thanh
                toán thành công (TransactionStatus = Success), phần lợi nhuận
                (sau khi trừ {commissionPercentage}% phí dịch vụ) sẽ được ghi
                nhận vào Wallet.PendingBalance (Số dư chờ thanh toán) của Bên B.
              </li>
              <li>
                <strong>Chuyển đổi (Dành riêng cho Freelance PT):</strong> Bên A
                sẽ thực hiện chuyển tiền sang số dư khả dụng của Bên B khi đạt
                một trong hai điều kiện sau (tùy điều kiện nào đến trước):
                <ul className="list-circle pl-6 mt-1">
                  <li>
                    Học viên hoàn thành 50% tổng số buổi học của gói đã mua.
                  </li>
                  <li>01 ngày sau khi kết thúc thời hạn của khóa học.</li>
                </ul>
              </li>
            </ul>
            <p>
              <strong>3.3. Quy trình Rút tiền (Withdrawal):</strong>
            </p>
            <ul className="list-disc pl-8 space-y-1">
              <li>
                Bên B chỉ có thể thực hiện yêu cầu rút tiền đối với số dư khả
                dụng trong ví.
              </li>
              <li>
                Bên B phải cung cấp đầy đủ và chính xác thông tin ngân hàng.
              </li>
              <li>
                Bên A cam kết xử lý yêu cầu rút tiền trong vòng 7 ngày làm việc
                kể từ khi nhận được yêu cầu hợp lệ.
              </li>
            </ul>
            <p>
              <strong>
                3.4. Xử lý Hoàn tiền/Khiếu nại (Refund/ReportCases):
              </strong>{" "}
              Trong trường hợp Khách hàng được hoàn tiền hoặc phát sinh khiếu
              nại (ReportCases) dẫn đến việc phải hoàn tiền, Bên B có trách
              nhiệm hoàn trả lại phần lợi nhuận đã nhận và/hoặc FitBridge có
              quyền thu hồi khoản phí dịch vụ đã chi trả.
            </p>
          </div>
        </section>

        {/* ĐIỀU 4 */}
        <section className="mb-6">
          <h2 className="text-base font-bold mb-3 uppercase text-center">
            ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN
          </h2>
          <div className="text-sm text-justify space-y-2">
            <p>
              <strong>
                4.1. Quyền và Nghĩa vụ của Bên A (FITBRIDGE PLATFORM):
              </strong>
            </p>
            <ul className="list-disc pl-8 space-y-1">
              <li>Cung cấp nền tảng công nghệ để Bên B quản lý kinh doanh.</li>
              <li>
                Hỗ trợ kỹ thuật và tư vấn cho Bên B trong quá trình sử dụng nền
                tảng.
              </li>
              <li>
                Đảm bảo an toàn thông tin và dữ liệu kinh doanh của Bên B theo
                chính sách bảo mật của nền tảng.
              </li>
              <li>Thu phí dịch vụ theo thỏa thuận tại Điều 3.</li>
            </ul>
            <p>
              <strong>4.2. Quyền và Nghĩa vụ của Bên B (FREELANCE PT):</strong>
            </p>
            <ul className="list-disc pl-8 space-y-1">
              <li>
                Sử dụng nền tảng FitBridge để quản lý lịch tập và gói đào tạo.
              </li>
              <li>
                Cung cấp thông tin chính xác, đầy đủ về bằng cấp, gói tập, và
                thông tin cá nhân.
              </li>
              <li>
                Tuân thủ các quy định vận hành, quy tắc về lịch tập, hủy/đổi
                lịch.
              </li>
              <li>Thanh toán phí dịch vụ cho Bên A đúng hạn và theo Điều 3.</li>
              <li>Đảm bảo chất lượng dịch vụ và an toàn cho khách hàng.</li>
            </ul>
          </div>
        </section>

        {/* ĐIỀU 5 */}
        <section className="mb-6">
          <h2 className="text-base font-bold mb-3 uppercase text-center">
            ĐIỀU 5: CÁC ĐIỀU KHOẢN BỔ SUNG VÀ ĐIỀU KIỆN
          </h2>
          <div className="text-sm text-justify space-y-2">
            <p>
              <strong>5.1. Chất lượng dịch vụ:</strong> Bên B cam kết duy trì
              KPI về đánh giá (Review), tỷ lệ hủy lịch. Nếu vi phạm, Bên A có
              quyền đình chỉ quyền đăng bán dịch vụ.
            </p>
            <p>
              <strong>5.2. Bảo mật:</strong> Bên B cam kết bảo mật thông tin
              Khách hàng.
            </p>
            <p>
              <strong>5.3. Chấm dứt Hợp đồng sớm:</strong> Quy định chấm dứt khi
              vi phạm cơ bản mà không khắc phục sau 15 ngày.
            </p>
            <p>
              <strong>5.4.</strong> Bên B có trách nhiệm thông báo bằng văn bản
              cho Bên A trước ít nhất 15 ngày trước khi thay đổi địa điểm kinh
              doanh.
            </p>
            {extraRules && extraRules.length > 0 && (
              <div className="mt-3">
                <p>
                  <strong>5.5. Các điều khoản bổ sung:</strong>
                </p>
                <ul className="list-disc pl-8 space-y-1">
                  {extraRules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ĐIỀU 6 */}
        <section className="mb-8">
          <h2 className="text-base font-bold mb-3 uppercase text-center">
            ĐIỀU 6: ĐIỀU KHOẢN CHUNG
          </h2>
          <div className="text-sm text-justify space-y-2">
            <p>
              <strong>6.1.</strong> Hợp đồng này có hiệu lực kể từ ngày ký.
            </p>
            <p>
              <strong>6.2.</strong> Mọi tranh chấp phát sinh sẽ được giải quyết
              qua thương lượng hoặc Tòa án tại TP.HCM.
            </p>
            <p>
              <strong>6.3.</strong> Hợp đồng được lập thành 02 bản có giá trị
              pháp lý như nhau, mỗi bên giữ 01 bản.
            </p>
          </div>
        </section>

        {/* Signatures */}
        <section className="flex justify-between mt-12 pt-8 border-t border-gray-300">
          <div className="w-[45%] text-center">
            <h3 className="text-sm font-bold mb-1">ĐẠI DIỆN BÊN A</h3>
            <p className="text-xs italic my-1">(Ký và ghi rõ họ tên)</p>
            <div className="min-h-[100px] flex items-center justify-center my-5">
              {contractData.companySignatureUrl ? (
                <img
                  src={contractData.companySignatureUrl}
                  alt="Company Signature"
                  className="max-w-[200px] max-h-[100px] object-contain"
                />
              ) : (
                <p className="text-gray-400">[Chữ ký Admin]</p>
              )}
            </div>
            <p className="font-bold mt-2.5">Lâm Quốc Phong</p>
          </div>

          <div className="w-[45%] text-center">
            <h3 className="text-sm font-bold mb-1">ĐẠI DIỆN BÊN B</h3>
            <p className="text-xs italic my-1">(Ký và ghi rõ họ tên)</p>
            <div className="min-h-[100px] flex items-center justify-center my-5">
              {signature || contractData.customerSignatureUrl ? (
                <img
                  src={signature || contractData.customerSignatureUrl}
                  alt="Customer Signature"
                  className="max-w-[200px] max-h-[100px] object-contain"
                />
              ) : (
                <p className="text-gray-400">[Chữ ký huấn luyện viên]</p>
              )}
            </div>
            <p className="font-bold mt-2.5">{fullName}</p>
          </div>
        </section>
      </div>
    );
  }
);

ContractTemplate.displayName = "ContractTemplate";

export default ContractTemplate;
