import { check } from "k6";
import http from "k6/http";
import { Options } from "k6/options";
import { HTTPClient } from "../../controllers/restfull-bookers/HTTPClient.ts";

const client = new HTTPClient(http);

export const options: Options = {
  vus: 1,
  duration: "1s",
  iterations: 1,
};

export function setup() {
  const token = client.auth.getToken();
  const bookingId = client.booking.getBookingId();
  return { token, bookingId };
}

export default function (data: { token: string; bookingId: number }) {
  const { token, bookingId } = data;
  const response = client.booking.updateBooking(token, bookingId);
  check(response, {
    "Update status code": (res) => res.status === 200,
    "Update request duration": (res) => res.timings.duration < 500,
  });
}

export function teardown(data: { token: string; bookingId: number }) {
  const { token, bookingId } = data;
  const response = client.booking.deleteBooking(token, bookingId);
  check(response, {
    "Delete status code": (res) => res.status === 201,
    "Delete request duration": (res) => res.timings.duration < 500,
  });
}