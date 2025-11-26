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
    } = contractData;

    // Render template for GymOwner
    if (contractType === "GymOwner") {
      return (
        <div
          ref={ref}
          className="max-w-[210mm] min-h-[297mm] p-[20mm] mx-auto bg-white shadow-lg font-serif text-black leading-relaxed"
        >
          <div className="text-center mb-8 border-b-2 border-black pb-5">
            <h1 className="text-2xl font-bold m-0 mb-2.5 uppercase">
              HỢP ĐỒNG HỢP TÁC PHÒNG TẬP
            </h1>
            <p className="my-1 text-sm">
              Số: {id?.substring(0, 8).toUpperCase()}
            </p>
            <p className="my-1 text-sm">
              Ngày:{" "}
              {new Date(createdAt || new Date()).toLocaleDateString("vi-VN")}
            </p>
          </div>

          <div className="mt-8">
            <section className="mb-6">
              <h2 className="text-base font-bold mb-2.5 uppercase text-center">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </h2>
              <h3 className="text-sm font-bold my-2.5 italic text-center">
                Độc lập - Tự do - Hạnh phúc
              </h3>
            </section>

            <section className="mb-6">
              <h2 className="text-base font-bold mb-2.5 uppercase text-center">
                BÊN A: FITBRIDGE PLATFORM
              </h2>
              <p className="my-2 text-justify text-[13px]">
                <strong>Địa chỉ:</strong> 7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Thành
                phố Hồ Chí Minh 700000
              </p>
              <p className="my-2 text-justify text-[13px]">
                <strong>Đại diện:</strong> Lâm Quốc Phong
              </p>
              <p className="my-2 text-justify text-[13px]">
                <strong>Chức vụ:</strong> Admin
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-base font-bold mb-2.5 uppercase text-center">
                BÊN B: PHÒNG TẬP
              </h2>
              <p className="my-2 text-justify text-[13px]">
                <strong>Tên phòng tập:</strong> {fullName}
              </p>
              <p className="my-2 text-justify text-[13px]">
                <strong>Mã số thuế:</strong> {identityCardNumber}
              </p>
              <p className="my-2 text-justify text-[13px]">
                <strong>Địa chỉ:</strong> {permanentAddress}
              </p>
              <p className="my-2 text-justify text-[13px]">
                <strong>Số điện thoại:</strong> {phoneNumber}
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-base font-bold mb-2.5 uppercase text-center">
                ĐIỀU 1: NỘI DUNG HỢP ĐỒNG
              </h2>
              <p className="my-2 text-justify text-[13px]">
                Bên A đồng ý cho Bên B sử dụng nền tảng FitBridge để quản lý và
                kinh doanh dịch vụ phòng tập thể hình. Bên B cam kết tuân thủ
                các điều khoản và điều kiện của nền tảng, cung cấp dịch vụ chất
                lượng cho khách hàng.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-base font-bold mb-2.5 uppercase text-center">
                ĐIỀU 2: THỜI HẠN HỢP ĐỒNG
              </h2>
              <p className="my-2 text-justify text-[13px]">
                <strong>Ngày bắt đầu:</strong>{" "}
                {new Date(startDate).toLocaleDateString("vi-VN")}
              </p>
              <p className="my-2 text-justify text-[13px]">
                <strong>Ngày kết thúc:</strong>{" "}
                {new Date(endDate).toLocaleDateString("vi-VN")}
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-base font-bold mb-2.5 uppercase text-center">
                ĐIỀU 3: PHÍ DỊCH VỤ
              </h2>
              <p className="my-2 text-justify text-[13px]">
                Bên B cam kết thanh toán cho Bên A phí dịch vụ là{" "}
                <strong>{commissionPercentage}%</strong> trên mỗi giao dịch
                thành công qua nền tảng FitBridge.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-base font-bold mb-2.5 uppercase text-center">
                ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN
              </h2>
              <h3 className="text-sm font-bold my-2.5">
                4.1. Quyền và nghĩa vụ của Bên A:
              </h3>
              <ul className="my-2.5 pl-8">
                <li className="my-1 text-justify text-[13px]">
                  Cung cấp nền tảng công nghệ để Bên B quản lý phòng tập
                </li>
                <li className="my-1 text-justify text-[13px]">
                  Hỗ trợ kỹ thuật và tư vấn cho Bên B
                </li>
                <li className="my-1 text-justify text-[13px]">
                  Đảm bảo an toàn thông tin và dữ liệu của Bên B
                </li>
                <li className="my-1 text-justify text-[13px]">
                  Thu phí dịch vụ theo thỏa thuận
                </li>
                <li className="my-1 text-justify text-[13px]">
                  Hỗ trợ marketing và quảng bá phòng tập trên nền tảng
                </li>
              </ul>

              <h3 className="text-sm font-bold my-2.5">
                4.2. Quyền và nghĩa vụ của Bên B:
              </h3>
              <ul className="my-2.5 pl-8">
                <li className="my-1 text-justify text-[13px]">
                  Sử dụng nền tảng FitBridge để quản lý phòng tập
                </li>
                <li className="my-1 text-justify text-[13px]">
                  Cung cấp thông tin chính xác và đầy đủ về phòng tập
                </li>
                <li className="my-1 text-justify text-[13px]">
                  Tuân thủ các quy định của nền tảng
                </li>
                <li className="my-1 text-justify text-[13px]">
                  Thanh toán phí dịch vụ đúng hạn
                </li>
                <li className="my-1 text-justify text-[13px]">
                  Đảm bảo chất lượng dịch vụ và cơ sở vật chất cho khách hàng
                </li>
                <li className="my-1 text-justify text-[13px]">
                  Quản lý huấn luyện viên và nhân viên phòng tập
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-base font-bold mb-2.5 uppercase text-center">
                ĐIỀU 5: ĐIỀU KHOẢN CHUNG
              </h2>
              <p className="my-2 text-justify text-[13px]">
                - Hợp đồng này có hiệu lực kể từ ngày ký.
                <br />
                - Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương
                lượng.
                <br />- Hợp đồng được lập thành 02 bản có giá trị pháp lý như
                nhau, mỗi bên giữ 01 bản.
              </p>
            </section>

            <section className="flex justify-between mt-12 pt-8">
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
                    <p>[Chữ ký Admin]</p>
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
                    <p>[Chữ ký chủ phòng tập]</p>
                  )}
                </div>
                <p className="font-bold mt-2.5">{fullName}</p>
              </div>
            </section>
          </div>
        </div>
      );
    }

    // Render template for FreelancePT
    return (
      <div
        ref={ref}
        className="max-w-[210mm] min-h-[297mm] p-[20mm] mx-auto bg-white shadow-lg font-serif text-black leading-relaxed"
      >
        <div className="text-center mb-8 border-b-2 border-black pb-5">
          <h1 className="text-2xl font-bold m-0 mb-2.5 uppercase">
            HỢP ĐỒNG HỢP TÁC HUẤN LUYỆN VIÊN
          </h1>
          <p className="my-1 text-sm">
            Số: {id?.substring(0, 8).toUpperCase()}
          </p>
          <p className="my-1 text-sm">
            Ngày:{" "}
            {new Date(createdAt || new Date()).toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div className="mt-8">
          <section className="mb-6">
            <h2 className="text-base font-bold mb-2.5 uppercase text-center">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </h2>
            <h3 className="text-sm font-bold my-2.5 italic text-center">
              Độc lập - Tự do - Hạnh phúc
            </h3>
          </section>

          <section className="mb-6">
            <h2 className="text-base font-bold mb-2.5 uppercase text-center">
              BÊN A: FITBRIDGE PLATFORM
            </h2>
            <p className="my-2 text-justify text-[13px]">
              <strong>Địa chỉ:</strong> 7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Thành
              phố Hồ Chí Minh 700000
            </p>
            <p className="my-2 text-justify text-[13px]">
              <strong>Đại diện:</strong> Lâm Quốc Phong
            </p>
            <p className="my-2 text-justify text-[13px]">
              <strong>Chức vụ:</strong> Admin
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-base font-bold mb-2.5 uppercase text-center">
              BÊN B: HUẤN LUYỆN VIÊN
            </h2>
            <p className="my-2 text-justify text-[13px]">
              <strong>Họ và tên:</strong> {fullName}
            </p>
            <p className="my-2 text-justify text-[13px]">
              <strong>CMND/CCCD:</strong> {identityCardNumber}
            </p>
            <p className="my-2 text-justify text-[13px]">
              <strong>Ngày cấp:</strong>{" "}
              {identityCardDate
                ? new Date(identityCardDate).toLocaleDateString("vi-VN")
                : ""}
            </p>
            <p className="my-2 text-justify text-[13px]">
              <strong>Nơi cấp:</strong> {identityCardPlace}
            </p>
            <p className="my-2 text-justify text-[13px]">
              <strong>Số điện thoại:</strong> {phoneNumber}
            </p>
            <p className="my-2 text-justify text-[13px]">
              <strong>Địa chỉ thường trú:</strong> {permanentAddress}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-base font-bold mb-2.5 uppercase text-center">
              ĐIỀU 1: NỘI DUNG HỢP ĐỒNG
            </h2>
            <p className="my-2 text-justify text-[13px]">
              Bên A đồng ý cho Bên B sử dụng nền tảng FitBridge để quản lý và
              kinh doanh dịch vụ huấn luyện viên cá nhân (Personal Trainer). Bên
              B cam kết tuân thủ các điều khoản và điều kiện của nền tảng, cung
              cấp dịch vụ huấn luyện chất lượng cho khách hàng.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-base font-bold mb-2.5 uppercase text-center">
              ĐIỀU 2: THỜI HẠN HỢP ĐỒNG
            </h2>
            <p className="my-2 text-justify text-[13px]">
              <strong>Ngày bắt đầu:</strong>{" "}
              {new Date(startDate).toLocaleDateString("vi-VN")}
            </p>
            <p className="my-2 text-justify text-[13px]">
              <strong>Ngày kết thúc:</strong>{" "}
              {new Date(endDate).toLocaleDateString("vi-VN")}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-base font-bold mb-2.5 uppercase text-center">
              ĐIỀU 3: PHÍ DỊCH VỤ
            </h2>
            <p className="my-2 text-justify text-[13px]">
              Bên B cam kết thanh toán cho Bên A phí dịch vụ là{" "}
              <strong>{commissionPercentage}%</strong> trên mỗi giao dịch thành
              công qua nền tảng FitBridge.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-base font-bold mb-2.5 uppercase text-center">
              ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN
            </h2>
            <h3 className="text-sm font-bold my-2.5">
              4.1. Quyền và nghĩa vụ của Bên A:
            </h3>
            <ul className="my-2.5 pl-8">
              <li className="my-1 text-justify text-[13px]">
                Cung cấp nền tảng công nghệ để Bên B quản lý lịch tập và khách
                hàng
              </li>
              <li className="my-1 text-justify text-[13px]">
                Hỗ trợ kỹ thuật và tư vấn cho Bên B
              </li>
              <li className="my-1 text-justify text-[13px]">
                Đảm bảo an toàn thông tin và dữ liệu của Bên B
              </li>
              <li className="my-1 text-justify text-[13px]">
                Thu phí dịch vụ theo thỏa thuận
              </li>
              <li className="my-1 text-justify text-[13px]">
                Hỗ trợ marketing và quảng bá huấn luyện viên trên nền tảng
              </li>
            </ul>

            <h3 className="text-sm font-bold my-2.5">
              4.2. Quyền và nghĩa vụ của Bên B:
            </h3>
            <ul className="my-2.5 pl-8">
              <li className="my-1 text-justify text-[13px]">
                Sử dụng nền tảng FitBridge để quản lý dịch vụ huấn luyện
              </li>
              <li className="my-1 text-justify text-[13px]">
                Cung cấp thông tin chính xác và đầy đủ về trình độ chuyên môn
              </li>
              <li className="my-1 text-justify text-[13px]">
                Tuân thủ các quy định của nền tảng
              </li>
              <li className="my-1 text-justify text-[13px]">
                Thanh toán phí dịch vụ đúng hạn
              </li>
              <li className="my-1 text-justify text-[13px]">
                Đảm bảo chất lượng dịch vụ huấn luyện cho khách hàng
              </li>
              <li className="my-1 text-justify text-[13px]">
                Có chứng chỉ và kinh nghiệm huấn luyện phù hợp
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-base font-bold mb-2.5 uppercase text-center">
              ĐIỀU 5: ĐIỀU KHOẢN CHUNG
            </h2>
            <p className="my-2 text-justify text-[13px]">
              - Hợp đồng này có hiệu lực kể từ ngày ký.
              <br />
              - Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương
              lượng.
              <br />- Hợp đồng được lập thành 02 bản có giá trị pháp lý như
              nhau, mỗi bên giữ 01 bản.
            </p>
          </section>

          <section className="flex justify-between mt-12 pt-8">
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
                  <p>[Chữ ký Admin]</p>
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
                  <p>[Chữ ký huấn luyện viên]</p>
                )}
              </div>
              <p className="font-bold mt-2.5">{fullName}</p>
            </div>
          </section>
        </div>
      </div>
    );
  }
);

ContractTemplate.displayName = "ContractTemplate";

export default ContractTemplate;
