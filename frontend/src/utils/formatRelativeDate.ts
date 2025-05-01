/**
 * use today yesturday
 * @param {string} dateString
 * @returns {string} today/yesturday
 */

export const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesturday = new Date(today);
  yesturday.setDate(yesturday.getDate() - 1);

  //for today
  if (date.toDateString() === today.toDateString()) {
    return "Heute";
  }

  //for yesturday
  if (date.toDateString() === yesturday.toDateString()) {
    return "Gestern";
  }

  return date.toLocaleDateString("de-DE");
};
