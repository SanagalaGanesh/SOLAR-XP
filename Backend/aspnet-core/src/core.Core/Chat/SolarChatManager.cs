using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp.Domain.Services;
namespace core.Chat
{
    public class SolarChatManager : DomainService
    {
        // 1. FINAL CALCULATION LOGIC
        public string GetRecommendation(string bill, string cuts)
        {
            // Logic 1: Bill decides Wattage
            string wattage = "450W";
            if (bill == "1500 - 4000") wattage = "850W";
            else if (bill == "4000 - 8000" || bill == "Above 8000") wattage = "1000W";

            // Logic 2: Cuts decide Type
            string type = "Solar Thin"; // Low cuts
            if (cuts == "Medium") type = "Solar Poly";
            if (cuts == "High") type = "Solar Mono";

            return $"Based on your inputs:\n" +
                   $"- Bill Range: {bill}\n" +
                   $"- Power Cuts: {cuts}\n\n" +
                   $"We recommend the **{type} - {wattage}** Model.\n" +
                   $"This fits your budget and energy needs perfectly!";
        }

        // 2. CONVERSATION FLOW
        public void ProcessStep(string currentStep, string userResponse, out string message, out List<string> options, out string nextStep, out bool isFinal)
        {
            // Default values
            message = "";
            options = new List<string>();
            nextStep = "";
            isFinal = false;

            switch (currentStep)
            {
                case "Intro":
                    if (userResponse == "Yes")
                    {
                        message = "1. For what purpose are you considering solar?";
                        options = new List<string> { "Home", "Office", "Industry" };
                        nextStep = "AskPurpose";
                    }
                    else
                    {
                        message = "No problem! You can browse our products manually.";
                        isFinal = true;
                    }
                    break;

                case "AskPurpose":
                    message = "2. What is your average monthly electricity bill?";
                    options = new List<string> { "1500 and less", "1500 - 4000", "4000 - 8000", "Above 8000" };
                    nextStep = "AskBill";
                    break;

                case "AskBill":
                    message = "3. How often do you face power cuts?";
                    options = new List<string> { "High", "Medium", "Low" };
                    nextStep = "AskCuts";
                    break;

                default:
                    // Start of chat
                    message = "Hi! Welcome to SolarXP. Shall we find the best solar model for you?";
                    options = new List<string> { "Yes", "No" };
                    nextStep = "Intro";
                    break;
            }
        }
    }
}
