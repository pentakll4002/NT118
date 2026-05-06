using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/debug")]
public class DebugController(AppDbContext db, IWebHostEnvironment env) : ControllerBase
{
    [HttpPost("ensure-user-role")]
    public ActionResult EnsureUserRole()
    {
        if (!env.IsDevelopment())
            return Forbid();

        db.Database.ExecuteSqlRaw(@"
            DO $$ BEGIN
                CREATE TYPE IF NOT EXISTS user_role AS ENUM ('buyer', 'seller', 'admin');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'buyer';
        ");

        return Ok(new { success = true });
    }
}
