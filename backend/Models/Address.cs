using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Address
{
    [Key]
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string FullNameEn { get; set; } = string.Empty;
    public string CodeName { get; set; } = string.Empty;
    
    // For districts, this points to ProvinceCode. For wards, this points to DistrictCode.
    public string? ParentCode { get; set; }
    
    public int Level { get; set; } // 1: Province, 2: District, 3: Ward
}
