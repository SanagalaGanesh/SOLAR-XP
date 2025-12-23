FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src
COPY ["src/core.Web.Host/core.Web.Host.csproj", "src/core.Web.Host/"]
COPY ["src/core.Web.Core/core.Web.Core.csproj", "src/core.Web.Core/"]
COPY ["src/core.Application/core.Application.csproj", "src/core.Application/"]
COPY ["src/core.Core/core.Core.csproj", "src/core.Core/"]
COPY ["src/core.EntityFrameworkCore/core.EntityFrameworkCore.csproj", "src/core.EntityFrameworkCore/"]
WORKDIR "/src/src/core.Web.Host"
RUN dotnet restore 

WORKDIR /src
COPY ["src/core.Web.Host", "src/core.Web.Host"]
COPY ["src/core.Web.Core", "src/core.Web.Core"]
COPY ["src/core.Application", "src/core.Application"]
COPY ["src/core.Core", "src/core.Core"]
COPY ["src/core.EntityFrameworkCore", "src/core.EntityFrameworkCore"]
WORKDIR "/src/src/core.Web.Host"
RUN dotnet publish -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
EXPOSE 80
WORKDIR /app
COPY --from=build /publish .
ENTRYPOINT ["dotnet", "core.Web.Host.dll"]
