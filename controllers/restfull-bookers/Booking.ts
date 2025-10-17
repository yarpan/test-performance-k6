import http from "k6/http";

export class Booking {
  http;
  url: string;
  readonly headers: object;
  readonly bookingData: object;

  constructor(http) {
    this.http = http;
    this.url = "https://restful-booker.herokuapp.com/booking";
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    this.bookingData = {
      firstname: "Jimmy",
      lastname: "Black",
      totalprice: 500,
      depositpaid: true,
      bookingdates: {
        checkin: "2025-09-01",
        checkout: "2025-09-07",
      },
      additionalneeds: "Dinner",
    };
  }

  getBookingId() {
    const response = this.http.post(
      this.url,
      JSON.stringify(this.bookingData),
      {
        headers: this.headers,
      }
    );

    const json = response.json();
    const bookingId = json!["bookingid"];

    return bookingId;
  }

  updateBooking(token: string, bookingId: number) {
    const response = this.http.put(
      `${this.url}/${bookingId}`,
      JSON.stringify(this.bookingData),
      {
        headers: {
          ...this.headers,
          Cookie: `token=${token}`,
        },
      }
    );
    return response;
  }

  deleteBooking(token: string, bookingId: number) {
    const response = this.http.del(`${this.url}/${bookingId}`, null, {
      headers: {
        ...this.headers,
        Cookie: `token=${token}`,
      },
    });
    return response;
  }
}