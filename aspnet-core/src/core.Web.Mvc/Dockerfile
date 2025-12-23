FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

RUN dotnet tool install -g Microsoft.Web.LibraryManager.Cli
RUN ln -s ~/.dotnet/tools/libman /usr/local/bin/libman

WORKDIR /src
COPY ["src/core.Web.Mvc/core.Web.Mvc.csproj", "src/core.Web.Mvc/"]
COPY ["src/core.Web.Core/core.Web.Core.csproj", "src/core.Web.Core/"]
COPY ["src/core.Application/core.Application.csproj", "src/core.Application/"]
COPY ["src/core.Core/core.Core.csproj", "src/core.Core/"]
COPY ["src/core.EntityFrameworkCore/core.EntityFrameworkCore.csproj", "src/core.EntityFrameworkCore/"]
WORKDIR "/src/src/core.Web.Mvc"
RUN dotnet restore 

WORKDIR /src
COPY ["src/core.Web.Mvc", "src/core.Web.Mvc"]
COPY ["src/core.Web.Core", "src/core.Web.Core"]
COPY ["src/core.Application", "src/core.Application"]
COPY ["src/core.Core", "src/core.Core"]
COPY ["src/core.EntityFrameworkCore", "src/core.EntityFrameworkCore"]
WORKDIR "/src/src/core.Web.Mvc"
RUN libman restore
RUN dotnet publish -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
EXPOSE 80
WORKDIR /app
COPY --from=build /publish .
ENTRYPOINT ["dotnet", "core.Web.Mvc.dll"]
