export const calculateDeliveryDate = (deliveryDays) => {
  const safeDays = Number(deliveryDays);

  const d = new Date();
  d.setHours(11, 30, 0, 0); // optional fixed time

  d.setDate(d.getDate() + (Number.isFinite(safeDays) ? safeDays : 10));
  return d;
};
