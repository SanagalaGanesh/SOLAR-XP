using core.Debugging;

namespace core;

public class coreConsts
{
    public const string LocalizationSourceName = "core";

    public const string ConnectionStringName = "Default";

    public const bool MultiTenancyEnabled = true;


    /// <summary>
    /// Default pass phrase for SimpleStringCipher decrypt/encrypt operations
    /// </summary>
    public static readonly string DefaultPassPhrase =
        DebugHelper.IsDebug ? "gsKxGZ012HLL3MI5" : "400e4e14aa84495bb1e2c7f4fba15e18";
}
