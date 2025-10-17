import http from "k6/http";
import { Auth } from "./Auth.ts";
import { Booking } from "./Booking.ts";


export class HTTPClient {
  auth: Auth;
  booking: Booking;
  constructor(http) {
    this.auth = new Auth(http);
    this.booking = new Booking(http);
  }
}