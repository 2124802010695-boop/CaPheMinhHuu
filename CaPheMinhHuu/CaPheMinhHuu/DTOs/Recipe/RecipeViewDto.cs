namespace CaPheMinhHuu.DTOs.Recipe
{
    public class RecipeViewDto
    {
        public int Id { get; set; } // ID của dòng công thức (để xóa)
        public int IngredientId { get; set; }
        public string IngredientName { get; set; } = string.Empty;
        public decimal QuantityRequired { get; set; }
        public string Unit { get; set; } = string.Empty; // Đơn vị gốc (Kg, Lít...)
    }
}