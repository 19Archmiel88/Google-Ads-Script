var email = [""]; 
var currencySymbol = "PLN";
var thousandsSeparator = ",";
var decimalMark = ".";
var labelName = "Over Budget";
var campaignPauser = true;
var MONTHLY_BUDGET = 0; // Kwota miesięczna jest określona z góry i do zmiany w każdym momencie
var UNUSED_BUDGET = 0; // Niewykorzystany budżet z poprzedniego miesiąca
var WHOLE_SPEND = 0;
var CAMPAIGNS_IDS = [];
var CAMPAIGNS_NAMES = [];
var ALL_CAMPAIGNS = 0;
var PAUSED_CAMPAIGNS = 0;
var campaignsToPause = [];

function main() {
  function basicCampaigns() {
    var currentBudget = 0;
    
    var selector = AdWordsApp.campaigns().withCondition("Status = ENABLED").get();

    while (selector.hasNext()) {
      var campaign = selector.next();
      currentBudget += campaign.getBudget().getAmount();
      Logger.log(campaign.getBudget());
      Logger.log(currentBudget);
      if (currentBudget >= MONTHLY_BUDGET) {
        campaign.pause();
        Logger.log("campaign paused" + campaign.getName());
      }
    }
  }

  function wholeSpend(MONTHLY_BUDGET) {
    var currentBudget = 0;
    var selector = AdWordsApp.shoppingCampaigns().withCondition("Status = ENABLED").get();
    var currentDate = new Date();
    var startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    var endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    while (selector.hasNext()) {
      var campaign = selector.next();
      var report = campaign.report("SELECT Cost, AmountSpent, CampaignName " +
                                  "DURING " + Utilities.formatDate(startDate, AdWordsApp.currentAccount().getTimeZone(), "yyyyMMdd") +
                                  "," + Utilities.formatDate(endDate, AdWordsApp.currentAccount().getTimeZone(), "yyyyMMdd"));
      
      var rows = report.rows();
      if (rows.hasNext()) {
        var row = rows.next();
        var spend = parseFloat(row['Cost'].replace(/,/g, ""));
        var budget = parseFloat(row['AmountSpent'].replace(/,/g, ""));
        var campaignName = row['CampaignName'];
        CAMPAIGNS_NAMES.push(campaignName);
        CAMPAIGNS_IDS.push(campaign.getId());
        
        currentBudget += budget;
        WHOLE_SPEND += spend;
        ALL_CAMPAIGNS += 1;
        campaignsToPause.push({
          CampaignId: campaign.getId(),
          CampaignName: campaignName,
          CampaignStatus: campaign.isEnabled() ? 'ENABLED' : 'PAUSED',
          Spend: spend,
          Budget: budget,
        });
      }
    }

    Logger.log('-- MONTHLY_BUDGET --');
    Logger.log(MONTHLY_BUDGET);
    Logger.log('-- whole spend --');
    Logger.log(WHOLE_SPEND);
    if (MONTHLY_BUDGET < WHOLE_SPEND) {
      Logger.log('You are worse with spending... ');
    }
    Logger.log('-- all Campaigns--');
    Logger.log(ALL_CAMPAIGNS);
  }

  wholeSpend(MONTHLY_BUDGET);

  function pauseCampaign(campID) {
    var campaignIterator = AdsApp.campaigns().withIds(campID).get();
    if (campaignIterator.hasNext()) {
      var campaign = campaignIterator.next();
      campaign.pause();
    }
  }

  function pauseBasicCampaigns(campaignName) { 
    var campaignIterator = AdsApp.campaigns().withCondition('Name = "' + campaignName + '"').get();
    if (campaignIterator.hasNext()) {
      var campaign = campaignIterator.next();
      campaign.pause();
      Logger.log('Pause basic campaign: ');
      Logger.log(campaignName);
    }
  }

  function pauseShoppingCampaigns(campaignName) { 
    var campaignIterator = AdsApp.shoppingCampaigns().withCondition('Name = "' + campaignName + '"').get();
    if (campaignIterator.hasNext()) {
      var campaign = campaignIterator.next();
      campaign.pause();
      Logger.log('Pause shopping campaign: ');
      Logger.log(campaignName);
    }
  }

  function makeChangeMessage(campaignData, changed, MONTHLY_BUDGET) {
    if (campaignData.length == 0) {
      return "";
    }
    var message = "<br><br>Campaigns that will be " + changed + "<br><br>";
    message += "<br><br>Your MONTHLY_BUDGET set for this Ads Account: <strong>" + MONTHLY_BUDGET + "</strong><br><br>";
    var table = "<table border=1 style='border: 1px solid black; border-collapse: collapse;'>";
    table += "<tr><th>Campaign ID</th><th>Campaign Name</th><th>Spend</th><th>Budget</th></tr>";
    for (var k = 0; k < campaignData.length; k++) {
      table += "<tr><td>" + campaignData[k].CampaignId + "</td><td>" + campaignData[k].CampaignName + "</td><td>" + formatNumber(campaignData[k].Spend, true) + "</td><td>" + formatNumber(campaignData[k].Budget, true) + "</td></tr>";
    }
    table += "</table>";
    message += table;
    return message;
  }

  function sendSummaryEmail(campaignsToPause, campaignPauser, email, MONTHLY_BUDGET) {
    var localDate = Utilities.formatDate(new Date(), AdWordsApp.currentAccount().getTimeZone(), "yyyy-MM-dd");
    var localTime = Utilities.formatDate(new Date(), AdWordsApp.currentAccount().getTimeZone(), "HH:mm");
    var subject = "Za niedługo skończy się budżet " + AdWordsApp.currentAccount().getName() + " - uwaga";
    var message = "";
    message += makeChangeMessage(campaignsToPause, 'paused', MONTHLY_BUDGET);
    if (message == "") {
      Logger.log("No message to send.");
      return;
    }
    message = localDate + " at " + localTime + " :" + message;
    MailApp.sendEmail({
      to: email.join(','),
      subject: subject,
      htmlBody: message
    });
    Logger.log("Message to " + email.join(',') + " sent.");
  }

  function formatNumber(number, isCurrency) {
    if (isCurrency) {
      var formattedNumber = number.toFixed(2);
      formattedNumber = formattedNumber.substr(0, formattedNumber.length - 3);
      formattedNumber = formattedNumber.split('').reverse().join('').replace(/(...)/g, "$1 ").trim().split('').reverse().join('').replace(/ /g, thousandsSeparator);
      formattedNumber = currencySymbol + formattedNumber + decimalMark + number.toFixed(2).substr(-2);
    } else {
      var formattedNumber = number.toFixed(0).split('').reverse().join('').replace(/(...)/g, "$1 ").trim().split('').reverse().join('').replace(/ /g, thousandsSeparator);
    }
    return formattedNumber;
  }

  if (WHOLE_SPEND >= MONTHLY_BUDGET) {
    Logger.log('PAUSE THIS SHIT');
    for (var i = 0; i < CAMPAIGNS_NAMES.length; i++) {
      //pauseBasicCampaigns(CAMPAIGNS_NAMES[i]);
      //pauseShoppingCampaigns(CAMPAIGNS_NAMES[i]);
    }
    sendSummaryEmail(campaignsToPause, true, email, MONTHLY_BUDGET);
    /* for(var i = 0; i < CAMPAIGNS_IDS.length; i++){
      pauseCampaign(CAMPAIGNS_IDS[i]);
    } */
  }

  // Na koniec miesiąca
  UNUSED_BUDGET = MONTHLY_BUDGET - WHOLE_SPEND;
  MONTHLY_BUDGET = 5000 + UNUSED_BUDGET; // Dodaj niewykorzystany budżet do budżetu na następny miesiąc
}
