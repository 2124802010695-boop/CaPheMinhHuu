namespace CaPheMinhHuu.Interfaces
{
    public interface IRepository<T> where T : class
    {
        // Trả về IQueryable hoặc IEnumerable tùy logic, ở đây dùng IEnumerable task async theo chuẩn EF Core
        Task<IEnumerable<T>> GetAllAsync();
        Task<T> GetByIdAsync(int id);
        Task AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
    }
}