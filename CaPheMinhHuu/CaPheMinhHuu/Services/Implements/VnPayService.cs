using System.Net;
using System.Security.Cryptography;
using System.Text;
using CaPheMinhHuu.DTOs.Payment;
using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Http;

namespace CaPheMinhHuu.Services.Implements
{
    public class VnPayService : IPaymentService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<VnPayService> _logger;

        public VnPayService(IConfiguration configuration, ILogger<VnPayService> logger)
        {
            _configuration = configuration;
            _logger        = logger;
        }

        public Task<string> CreateVnPayUrlAsync(int orderId, decimal amount, string orderCode, string ipAddress)
        {
            var vnpUrl      = _configuration["VnPay:BaseUrl"]!;
            var tmnCode     = _configuration["VnPay:TmnCode"]!;
            var hashSecret  = _configuration["VnPay:HashSecret"]!;
            var returnUrl   = _configuration["VnPay:ReturnUrl"]!;

            var createDate  = DateTime.Now.ToString("yyyyMMddHHmmss");
            var expireDate  = DateTime.Now.AddMinutes(15).ToString("yyyyMMddHHmmss");

            var vnpParams = new SortedDictionary<string, string>
            {
                ["vnp_Version"]    = "2.1.0",
                ["vnp_Command"]    = "pay",
                ["vnp_TmnCode"]    = tmnCode,
                ["vnp_Amount"]     = ((long)(amount * 100)).ToString(),
                ["vnp_CreateDate"] = createDate,
                ["vnp_CurrCode"]   = "VND",
                ["vnp_IpAddr"]     = ipAddress,
                ["vnp_Locale"]     = "vn",
                ["vnp_OrderInfo"]  = $"Thanh toan don hang {orderCode}",
                ["vnp_OrderType"]  = "other",
                ["vnp_ReturnUrl"]  = returnUrl,
                ["vnp_TxnRef"]     = orderCode,
                ["vnp_ExpireDate"] = expireDate
            };

            var queryString = string.Join("&", vnpParams
                .Select(kv => $"{WebUtility.UrlEncode(kv.Key)}={WebUtility.UrlEncode(kv.Value)}"));

            var signData = string.Join("&", vnpParams
                .Select(kv => $"{kv.Key}={kv.Value}"));

            var secureHash = HmacSha512(hashSecret, signData);

            var paymentUrl = $"{vnpUrl}?{queryString}&vnp_SecureHash={secureHash}";

            _logger.LogInformation("VnPay URL created for order {OrderCode}", orderCode);

            return Task.FromResult(paymentUrl);
        }

        public Task<PaymentResultDto> ProcessCallbackAsync(IQueryCollection query)
        {
            var hashSecret   = _configuration["VnPay:HashSecret"]!;
            var vnpSecureHash = query["vnp_SecureHash"].ToString();

            // Lấy tất cả params trừ vnp_SecureHash để verify
            var vnpParams = new SortedDictionary<string, string>();
            foreach (var key in query.Keys)
            {
                if (key.StartsWith("vnp_") && key != "vnp_SecureHash" && key != "vnp_SecureHashType")
                    vnpParams[key] = query[key].ToString();
            }

            var signData   = string.Join("&", vnpParams.Select(kv => $"{kv.Key}={kv.Value}"));
            var checkHash  = HmacSha512(hashSecret, signData);

            var isValid    = checkHash.Equals(vnpSecureHash, StringComparison.OrdinalIgnoreCase);
            var responseCode = query["vnp_ResponseCode"].ToString();
            var isSuccess  = isValid && responseCode == "00";

            var result = new PaymentResultDto
            {
                IsSuccess     = isSuccess,
                OrderCode     = query["vnp_TxnRef"].ToString(),
                TransactionId = query["vnp_TransactionNo"].ToString(),
                Amount        = long.TryParse(query["vnp_Amount"].ToString(), out var amt) ? amt / 100m : 0,
                Message       = isSuccess ? "Thanh toán thành công" : $"Thanh toán thất bại (mã: {responseCode})"
            };

            _logger.LogInformation("VnPay callback: {OrderCode} — {Status}", result.OrderCode, result.IsSuccess);

            return Task.FromResult(result);
        }

        private static string HmacSha512(string key, string data)
        {
            var keyBytes  = Encoding.UTF8.GetBytes(key);
            var dataBytes = Encoding.UTF8.GetBytes(data);
            using var hmac = new HMACSHA512(keyBytes);
            var hash = hmac.ComputeHash(dataBytes);
            return Convert.ToHexString(hash).ToLower();
        }
    }
}
