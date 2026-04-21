using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace Backend.Services.VNPay
{
    public static class StringExtension
    {
        public static string AsHmacSHA512(this string inputData, string key)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(inputData);
            using var hmac = new HMACSHA512(keyBytes);
            var hashValue = hmac.ComputeHash(inputBytes);
            return BitConverter.ToString(hashValue).Replace("-", "").ToLower();
        }
    }

    public static class HttpContextExtensions
    {
        public static string? GetIpAddress(this HttpContext? context)
        {
            if (context == null) return "127.0.0.1";
            var ipAddress = context.Connection.RemoteIpAddress?.MapToIPv4()?.ToString();
            if (string.IsNullOrEmpty(ipAddress) || ipAddress == "0.0.0.1" || ipAddress == "::1")
            {
                ipAddress = "127.0.0.1";
            }
            return ipAddress;
        }
    }

    public class VnPayComparer : IComparer<string>
    {
        public int Compare(string? x, string? y)
        {
            if (x == y) return 0;
            if (x == null) return -1;
            if (y == null) return 1;
            var vnpCompare = CompareInfo.GetCompareInfo("en-US");
            return vnpCompare.Compare(x, y, CompareOptions.Ordinal);
        }
    }
}
