using Microsoft.AspNetCore.Http;

namespace Backend.Services.VNPay
{
    public interface IVnpayClient
    {
        PaymentUrlDetail CreatePaymentUrl(VnpayPaymentRequest request);
        PaymentUrlDetail CreatePaymentUrl(double money, string description, BankCode bankCode = BankCode.ANY);
        VnpayPaymentResult GetPaymentResult(IQueryCollection parameters);
        VnpayPaymentResult GetPaymentResult(HttpRequest httpRequest);
    }
}
