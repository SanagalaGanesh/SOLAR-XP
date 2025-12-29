using System.Collections.Generic;

namespace core.Solar.Dto
{
    public class SubmitQuoteInput
    {
        public long UserId { get; set; }
        public string Mobile { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public List<string> SelectedTypes { get; set; }
        public List<int> SelectedWatts { get; set; }
    }

    public class ItemInputDto
    {
        public int ItemId { get; set; }
    }
}