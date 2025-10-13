import { check } from "k6";
import http from "k6/http";
import { Options } from "k6/options";
import { Auth } from "../../controllers/restfull-bookers/Auth.ts";
import { Booking } from "../../controllers/restfull-bookers/Booking.ts";

const auth = new Auth(http);
const booking = new Booking(http);

export const options: Options = {
    vus: 1,
    duration: "1s",
    iterations: 1,
};

export function setup() {
    const token = auth.getToken();
    const bookingId = booking.getBookingId();
    return { token, bookingId };
}

export default function (data: { token: string; bookingId: number }) {
    const { token, bookingId } = data;
    const response = booking.updateBooking(token, bookingId);
    check(response, {
        "Update status code": (res) => res.status === 200,
        "Update request duration": (res) => res.timings.duration < 500,
    });
}

export function teardown(data: { token: string; bookingId: number }) {
    const { token, bookingId } = data;
    const response = booking.deleteBooking(token, bookingId);
    check(response, {
        "Teardown status code": (res) => res.status === 201,
        "Teardown request duration": (res) => res.timings.duration < 500,
    });
}