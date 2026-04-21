using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Reflection;

namespace Backend.Services.VNPay
{
    public enum BankCode
    {
        ANY,
        VNPAYQR,
        VNBANK,
        INTCARD,
        VISA,
        MASTERCARD,
        JCB,
        UPI,
        VBCARD,
        VPBANK,
        VIETCOMBANK,
        VIETINBANK,
        BIDV,
        AGRIBANK,
        SACOMBANK,
        TECHCOMBANK,
        ACB,
        HDBANK,
        SHB,
        SCB,
        TPBANK,
        LIENVIETPOSTBANK,
        SEABANK,
        ABBANK,
        BAB,
        PVCB,
        OCEANBANK,
        NCB,
        EXIMBANK,
        MSBANK,
        NAMABANK,
        VNMART,
        VIETCAPITALBANK,
        OCB,
        IVB,
        SHV,
        VISA_MASTERCARD,
    }

    public enum Currency { VND, USD }

    public enum DisplayLanguage { VI, EN }

    public enum PaymentResponseCode
    {
        [Description("Giao dịch thành công")] Code_00 = 00,
        [Description("Giao dịch chưa hoàn tất")] Code_01 = 01,
        [Description("Giao dịch bị lỗi")] Code_02 = 02,
        [Description("Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)")] Code_04 = 04,
        [Description("VNPAY đang xử lý giao dịch này (GD hoàn tiền)")] Code_05 = 05,
        [Description("VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)")] Code_06 = 06,
        [Description("Giao dịch bị nghi ngờ gian lận")] Code_07 = 07,
        [Description("Giao dịch hoàn trả bị từ chối")] Code_09 = 09,
        [Description("Thông tin gửi sang không khớp với thông tin đã đăng ký tại hệ thống VNPAY")] Code_10 = 10,
        [Description("Khách hàng hủy thanh toán")] Code_24 = 24,
        [Description("Giao dịch không thành công do: Khách hàng nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.")] Code_75 = 75,
        [Description("Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.")] Code_79 = 79,
        [Description("Giao dịch không thành công do: Thiết bị của Quý khách đã vượt quá hạn mức sử dụng thanh toán trong ngày.")] Code_91 = 91,
        [Description("Giao dịch không thành công do: Số tiền thanh toán vượt quá hạn mức thanh toán trong ngày.")] Code_94 = 94,
        [Description("Các lỗi khác (System Error)")] Code_99 = 99,
    }

    public enum TransactionStatusCode
    {
        [Description("Giao dịch thành công")] Code_00 = 00,
        [Description("Giao dịch chưa hoàn tất")] Code_01 = 01,
        [Description("Giao dịch bị lỗi")] Code_02 = 02,
        [Description("Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)")] Code_04 = 04,
        [Description("VNPAY đang xử lý giao dịch này (GD hoàn tiền)")] Code_05 = 05,
        [Description("VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)")] Code_06 = 06,
        [Description("Giao dịch bị nghi ngờ gian lận")] Code_07 = 07,
        [Description("Giao dịch hoàn trả bị từ chối")] Code_09 = 09,
    }

    public class VnpayPaymentRequest
    {
        public long PaymentId { get; set; } = DateTime.Now.Ticks;
        public double Money { get; set; }
        public string Description { get; set; } = string.Empty;
        public BankCode BankCode { get; set; } = BankCode.ANY;
        public DateTime CreatedTime { get; set; } = DateTime.UtcNow.AddHours(7);
        public Currency Currency { get; set; } = Currency.VND;
        public DisplayLanguage Language { get; set; } = DisplayLanguage.VI;
    }

    public class VnpayPaymentResult
    {
        public long PaymentId { get; set; }
        public long VnpayTransactionId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? CardType { get; set; }
        public DateTime Timestamp { get; set; }
        public BankingInfor? BankingInfor { get; set; }
    }

    public class BankingInfor
    {
        public string? BankCode { get; set; }
        public string? BankTransactionId { get; set; }
    }

    public class PaymentUrlDetail
    {
        public long PaymentId { get; set; }
        public string Url { get; set; } = string.Empty;
        public SortedList<string, string> Parameters { get; set; } = new();
    }

    public class VnpayException : Exception
    {
        public TransactionStatusCode TransactionStatusCode { get; set; }
        public PaymentResponseCode PaymentResponseCode { get; set; }

        public VnpayException(string message) : base(message) { }
        public VnpayException(string message, Exception innerException) : base(message, innerException) { }
    }

    public static class EnumExtensions
    {
        public static string GetDescription(this Enum value)
        {
            var field = value.GetType().GetField(value.ToString());
            if (field == null) return value.ToString();
            var attribute = field.GetCustomAttribute<DescriptionAttribute>();
            return attribute == null ? value.ToString() : attribute.Description;
        }
    }
}
