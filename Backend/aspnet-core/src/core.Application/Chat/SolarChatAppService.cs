using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using Abp.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace core.Chat
{
    public class SolarChatAppService : ApplicationService
    {
        private readonly SolarChatManager _chatManager;

        public SolarChatAppService(SolarChatManager chatManager)
        {
            _chatManager = chatManager;
        }

        [HttpPost]
        public ChatResponse Interact(ChatInput input)
        {
            var response = new ChatResponse
            {
                // Save History (State Management)
                SavedPurpose = input.UserResponse == "Home" || input.UserResponse == "Office" || input.UserResponse == "Industry" ? input.UserResponse : input.SavedPurpose,
                SavedBill = input.CurrentStep == "AskBill" ? input.UserResponse : input.SavedBill,
                SavedCuts = input.CurrentStep == "AskCuts" ? input.UserResponse : input.SavedCuts,
                IsFinalResult = false
            };

            // Case: Final Calculation (Logic calls Manager)
            if (input.CurrentStep == "AskCuts")
            {
                string recommendation = _chatManager.GetRecommendation(input.SavedBill, input.UserResponse);

                response.Message = recommendation;
                response.IsFinalResult = true;
                return response;
            }

            // Case: Normal Flow (Calls Manager)
            string msg;
            List<string> opts;
            string nxt;
            bool fin;

            _chatManager.ProcessStep(input.CurrentStep, input.UserResponse, out msg, out opts, out nxt, out fin);

            response.Message = msg;
            response.Options = opts;
            response.NextStep = nxt;
            response.IsFinalResult = fin;

            return response;
        }
    }

    // --- DTO Classes (Inside the same file) ---

    public class ChatInput
    {
        public string CurrentStep { get; set; }
        public string UserResponse { get; set; }

        public string SavedPurpose { get; set; }
        public string SavedBill { get; set; }
        public string SavedCuts { get; set; }
    }

    public class ChatResponse
    {
        public string Message { get; set; }
        public List<string> Options { get; set; }
        public string NextStep { get; set; }
        public bool IsFinalResult { get; set; }

        public string SavedPurpose { get; set; }
        public string SavedBill { get; set; }
        public string SavedCuts { get; set; }
    }
}