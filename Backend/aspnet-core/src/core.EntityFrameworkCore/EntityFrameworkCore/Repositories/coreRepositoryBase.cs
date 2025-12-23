using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore;
using Abp.EntityFrameworkCore.Repositories;

namespace core.EntityFrameworkCore.Repositories;

/// <summary>
/// Base class for custom repositories of the application.
/// </summary>
/// <typeparam name="TEntity">Entity type</typeparam>
/// <typeparam name="TPrimaryKey">Primary key type of the entity</typeparam>
public abstract class coreRepositoryBase<TEntity, TPrimaryKey> : EfCoreRepositoryBase<coreDbContext, TEntity, TPrimaryKey>
    where TEntity : class, IEntity<TPrimaryKey>
{
    protected coreRepositoryBase(IDbContextProvider<coreDbContext> dbContextProvider)
        : base(dbContextProvider)
    {
    }

    // Add your common methods for all repositories
}

/// <summary>
/// Base class for custom repositories of the application.
/// This is a shortcut of <see cref="coreRepositoryBase{TEntity,TPrimaryKey}"/> for <see cref="int"/> primary key.
/// </summary>
/// <typeparam name="TEntity">Entity type</typeparam>
public abstract class coreRepositoryBase<TEntity> : coreRepositoryBase<TEntity, int>, IRepository<TEntity>
    where TEntity : class, IEntity<int>
{
    protected coreRepositoryBase(IDbContextProvider<coreDbContext> dbContextProvider)
        : base(dbContextProvider)
    {
    }

    // Do not add any method here, add to the class above (since this inherits it)!!!
}
