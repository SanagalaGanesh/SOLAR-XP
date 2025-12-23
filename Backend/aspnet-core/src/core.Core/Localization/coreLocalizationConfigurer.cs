using Abp.Configuration.Startup;
using Abp.Localization.Dictionaries;
using Abp.Localization.Dictionaries.Xml;
using Abp.Reflection.Extensions;

namespace core.Localization;

public static class coreLocalizationConfigurer
{
    public static void Configure(ILocalizationConfiguration localizationConfiguration)
    {
        localizationConfiguration.Sources.Add(
            new DictionaryBasedLocalizationSource(coreConsts.LocalizationSourceName,
                new XmlEmbeddedFileLocalizationDictionaryProvider(
                    typeof(coreLocalizationConfigurer).GetAssembly(),
                    "core.Localization.SourceFiles"
                )
            )
        );
    }
}
