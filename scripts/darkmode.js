const updateTheme = (isDark) => {
  if (isDark) {
    $('html').addClass('dark');
  } else {
    $('html').removeClass('dark');
  }
};

// Initialize dark mode from storage on page load
chrome.storage.local.get(['darkmodeFlag'], function (darkmode_flag) {
  const isDark = darkmode_flag.darkmodeFlag === 1;
  $('#darkmode-toggle').prop('checked', isDark);
  updateTheme(isDark);
});

$('#darkmode-toggle').change(function () {
  const isDark = $(this).is(':checked');
  updateTheme(isDark);
  // Persist preference
  chrome.storage.local.set({ 'darkmodeFlag': isDark ? 1 : 0 });
});