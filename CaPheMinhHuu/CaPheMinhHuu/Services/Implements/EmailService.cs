using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.DTOs.Email;

namespace CaPheMinhHuu.Services.Implements
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;

        // Block Footer tái sử dụng cho mọi email
        private readonly string _emailFooter = @"
            <hr style='border: none; border-top: 1px dashed #ccc; margin: 25px 0;' />
            <div style='text-align: center; font-size: 13px; color: #666; line-height: 1.6;'>
                <strong>Cà Phê Minh Hữu</strong><br/>
                📍 Địa chỉ: Phường Phú Hòa, TP. Thủ Dầu Một, Bình Dương<br/>
                📞 Hotline: 0357 058 801
            </div>";

        public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public async Task SendOtpAsync(string toEmail, string otpCode, string purpose)
        {
            string subject = "Mã xác thực (OTP) - Cà Phê Minh Hữu";
            string body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                    <div style='background-color: #4CAF50; color: white; padding: 20px; text-align: center;'>
                        <h2>Xác thực tài khoản</h2>
                    </div>
                    <div style='padding: 20px; color: #333; line-height: 1.6;'>
                        <p>Chào bạn,</p>
                        <p>Bạn đang yêu cầu mã xác thực cho thao tác: <strong>{purpose}</strong>.</p>
                        <p>Dưới đây là mã OTP của bạn:</p>
                        <div style='text-align: center; margin: 20px 0;'>
                            <span style='font-size: 24px; font-weight: bold; background-color: #f4f4f4; padding: 10px 20px; border-radius: 4px; letter-spacing: 2px;'>{otpCode}</span>
                        </div>
                        <p>Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                        {_emailFooter}
                    </div>
                </div>";

            await SendEmailCoreAsync(toEmail, subject, body);
        }

        public async Task SendOrderConfirmationAsync(string toEmail, OrderEmailDto orderData)
        {
            var itemsHtml = new StringBuilder();
            foreach (var item in orderData.Items)
            {
                itemsHtml.Append($@"
                    <tr>
                        <td style='padding: 8px; border-bottom: 1px solid #ddd;'>{item.ProductName}</td>
                        <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: center;'>{item.Quantity}</td>
                        <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: right;'>{item.Price:N0}đ</td>
                    </tr>");
            }

            string subject = $"Xác nhận đơn hàng #{orderData.OrderCode} - Cà Phê Minh Hữu";
            string body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                    <div style='background-color: #FF9800; color: white; padding: 20px; text-align: center;'>
                        <h2>Đơn hàng đã được ghi nhận!</h2>
                    </div>
                    <div style='padding: 20px; color: #333; line-height: 1.6;'>
                        <p>Chào <strong>{orderData.CustomerName}</strong>,</p>
                        <p>Cảm ơn bạn đã đặt hàng. Bếp đang tiến hành chuẩn bị các món sau:</p>
                        
                        <div style='background-color: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;'>
                            <ul style='list-style-type: none; padding: 0; margin: 0;'>
                                <li>Mã đơn: <strong>{orderData.OrderCode}</strong></li>
                                <li>Thời gian: <strong>{orderData.OrderDate:dd/MM/yyyy HH:mm}</strong></li>
                                <li>Vị trí: <strong>{orderData.TableNumber}</strong></li>
                                <li>Thanh toán: <strong>{orderData.PaymentMethod}</strong></li>
                            </ul>
                        </div>
                        
                        <table style='width: 100%; border-collapse: collapse; margin-bottom: 15px;'>
                            <thead>
                                <tr style='background-color: #f4f4f4;'>
                                    <th style='padding: 8px; text-align: left; border-bottom: 2px solid #ddd;'>Tên món</th>
                                    <th style='padding: 8px; text-align: center; border-bottom: 2px solid #ddd;'>SL</th>
                                    <th style='padding: 8px; text-align: right; border-bottom: 2px solid #ddd;'>Đơn giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemsHtml}
                            </tbody>
                        </table>
                        
                        <div style='text-align: right; font-size: 16px;'>
                            <strong>Tổng cộng: <span style='color: #FF9800;'>{orderData.TotalAmount:N0} VNĐ</span></strong>
                        </div>
                        {_emailFooter}
                    </div>
                </div>";

            await SendEmailCoreAsync(toEmail, subject, body);
        }

        public async Task SendPaymentReceiptAsync(string toEmail, string orderCode, string transactionId, decimal amount)
        {
            string subject = $"Biên lai thanh toán #{orderCode} - Cà Phê Minh Hữu";
            string body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                    <div style='background-color: #2196F3; color: white; padding: 20px; text-align: center;'>
                        <h2>Thanh toán thành công!</h2>
                    </div>
                    <div style='padding: 20px; color: #333; line-height: 1.6;'>
                        <p>Hệ thống đã ghi nhận khoản thanh toán cho đơn hàng <strong>#{orderCode}</strong>.</p>
                        
                        <div style='background-color: #f9f9f9; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;'>
                            <ul style='list-style-type: none; padding: 0; margin: 0;'>
                                <li style='margin-bottom: 10px;'>Mã giao dịch: <strong>{transactionId}</strong></li>
                                <li>Số tiền đã thu: <strong style='font-size: 18px; color: #2196F3;'>{amount:N0} VNĐ</strong></li>
                            </ul>
                        </div>
                        <p>Cảm ơn bạn đã sử dụng dịch vụ. Hẹn gặp lại bạn sớm nhất!</p>
                        {_emailFooter}
                    </div>
                </div>";

            await SendEmailCoreAsync(toEmail, subject, body);
        }

        private async Task SendEmailCoreAsync(string toEmail, string subject, string htmlBody)
        {
            try
            {
                // Sử dụng đúng các Key mà bạn đã chỉ định
                var host = _configuration["EmailSettings:SmtpHost"] ?? "smtp.gmail.com";
                var port = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
                var senderEmail = _configuration["EmailSettings:SenderEmail"];
                var appPassword = _configuration["EmailSettings:AppPassword"];
                var senderName = _configuration["EmailSettings:SenderName"] ?? "Cà Phê Minh Hữu";

                // Null check - Guard Clause
                if (string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(appPassword))
                {
                    throw new InvalidOperationException("EmailSettings:SenderEmail và AppPassword chưa được cấu hình trong appsettings.json");
                }

                using var client = new SmtpClient(host, port)
                {
                    EnableSsl = true,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    // BẮT BUỘC đặt trước Credentials
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(senderEmail, appPassword)
                };

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                _logger.LogInformation("Đang gửi email tới {Email} | Subject: {Subject}", toEmail, subject);
                await client.SendMailAsync(mailMessage);
                _logger.LogInformation("Giao dịch email hoàn tất cho {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gửi email tới {Email}. Chi tiết: {Message}", toEmail, ex.Message);
                throw;
            }
        }
    }
}