import { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";

import { Role } from "@prisma/client";
import prismaMock from "~/lib/test/prisma-mock";
import { sendVerificationEmail } from "~/lib/emails";

import handler from "~/pages/api/auth/register";
import { generateEmailVerificationToken, hashPassword } from "~/lib/accounts";

jest.mock("~/lib/emails", () => ({
  sendVerificationEmail: jest.fn(),
}));

jest.mock("~/lib/accounts", () => ({
  generateEmailVerificationToken: jest.fn(),
  hashPassword: jest.fn(),
}));

const mockGenerateEmailVerificationToken =
  generateEmailVerificationToken as unknown as jest.Mock;

const mockHashPassword = hashPassword as unknown as jest.Mock;

afterEach(() => {
  jest.clearAllMocks();
});

const fakeUserRegistrationParams = {
  name: "Test User",
  email: "hello@example.com",
  password: "1234abc*",
};

describe("/api/auth/register", () => {
  it("creates a new account when given the right parameters", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: fakeUserRegistrationParams,
    });

    const user = {
      id: 7,
    };

    prismaMock.user.findFirst.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce(user as any);

    await handler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );

    expect(res.statusCode).toBe(201);
    expect(res._isEndCalled()).toBe(true);
  });

  it("returns an error on non-POST request methods", async () => {
    const { req, res } = createMocks({ method: "GET" });

    await handler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );

    expect(res.statusCode).toBe(405);
    expect(res._isEndCalled()).toBe(true);
  });

  it("returns an error on invalid parameters", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {},
    });

    await handler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );

    expect(res.statusCode).toBe(400);
    expect(res._isEndCalled()).toBe(true);
  });

  it("localizes verify e-mail message based on `Accept-Language` header", async () => {
    const language = "en";

    const { req, res } = createMocks({
      method: "POST",
      body: {
        ...fakeUserRegistrationParams,
        language,
      },
    });

    const { name, email } = fakeUserRegistrationParams;
    const user = {
      id: 7,
      name,
      email,
    };

    prismaMock.user.findFirst.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce(user as any);

    const emailVerificationToken = "ABCD1234";
    mockGenerateEmailVerificationToken.mockReturnValueOnce(
      emailVerificationToken
    );

    const passwordHash = "password-hash";
    mockHashPassword.mockReturnValueOnce(passwordHash);

    await handler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );

    expect(res.statusCode).toBe(201);
    expect(res._isEndCalled()).toBe(true);

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        name,
        email,
        emailVerificationToken,
        role: Role.PARTICIPANT,
        passwordHash,
      },
    });
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      user,
      language,
      emailVerificationToken
    );
  });
});