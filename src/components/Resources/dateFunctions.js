// Returns the ISO week of the date.
export const weekNumber = date => {
  const tmp = new Date(date.getTime());
  tmp.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  // January 4 is always in week 1.
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return (
    1 +
    Math.round(
      ((tmp.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
};

// Returns the four-digit year corresponding to the ISO week of the date.
export const weekYear = date => {
  const tmp = new Date(date.getTime());
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  return tmp.getFullYear();
};
