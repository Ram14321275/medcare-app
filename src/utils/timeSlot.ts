export const getCurrentSlot = (): "morning" | "afternoon" | "night" => {
  const currentHour = new Date().getHours();

  if (currentHour >= 6 && currentHour < 11) {
    return "morning";
  } else if (currentHour >= 11 && currentHour < 16) {
    return "afternoon";
  } else {
    // Treat everything else (even 10 PM to 6 AM) as night for now, 
    // or strictly 4 PM to 10 PM. Let's make it simple.
    return "night";
  }
};
