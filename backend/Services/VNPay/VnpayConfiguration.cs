using System;

namespace Backend.Services.VNPay
{
    public class VnpayConfiguration
    {
        public string TmnCode { get; set; } = string.Empty;
        public string HashSecret { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        public string CallbackUrl { get; set; } = string.Empty;
        public string Version { get; set; } = "2.1.0";
        public string OrderType { get; set; } = "other";

        internal void EnsureValid()
        {
            if (string.IsNullOrEmpty(TmnCode)) throw new ArgumentException("TmnCode is required.");
            if (string.IsNullOrEmpty(HashSecret)) throw new ArgumentException("HashSecret is required.");
            if (string.IsNullOrEmpty(BaseUrl)) throw new ArgumentException("BaseUrl is required.");
            if (string.IsNullOrEmpty(CallbackUrl)) throw new ArgumentException("CallbackUrl is required.");
        }
    }
}
