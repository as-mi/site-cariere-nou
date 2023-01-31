import { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";

import { Role } from "@prisma/client";

import { getServerSession } from "~/lib/auth";

import prismaMock from "~/lib/test/prisma-mock";
import handler from "~/pages/api/images/[id]";

jest.mock("~/lib/auth", () => ({
  getServerSession: jest.fn(),
}));

const mockGetServerSession = getServerSession as unknown as jest.Mock;

afterEach(() => {
  mockGetServerSession.mockClear();
});

describe("/api/images/[id]", () => {
  it("returns an error status on unsupported request methods", async () => {
    const { req, res } = createMocks({ method: "PUT" });

    await handler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );

    expect(res.statusCode).toBe(405);
    expect(res._isEndCalled()).toBe(true);
  });

  describe("GET", () => {
    it("returns the requested image when it exists", async () => {
      const id = 1234;
      const { req, res } = createMocks({
        method: "GET",
        query: {
          id: id.toString(),
        },
      });

      const image = {
        contentType: "image/png",
        data: "<image data>",
      };

      prismaMock.image.findUnique.mockResolvedValueOnce(image as any);

      await handler(
        req as unknown as NextApiRequest,
        res as unknown as NextApiResponse
      );

      expect(res.statusCode).toBe(200);
      expect(res._isEndCalled()).toBe(true);
      expect(res.getHeader("Content-Type")).toBe(image.contentType);
      expect(res._getData()).toBe(image.data);
    });

    it("returns an error status when no image ID is given", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {
          id: undefined,
        },
      });

      await handler(
        req as unknown as NextApiRequest,
        res as unknown as NextApiResponse
      );

      expect(res.statusCode).toBe(400);
      expect(res._isEndCalled()).toBe(true);
    });

    it("returns a 404 not found error when image is missing from DB", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {
          id: "1234",
        },
      });

      prismaMock.image.findUnique.mockResolvedValueOnce(null);

      await handler(
        req as unknown as NextApiRequest,
        res as unknown as NextApiResponse
      );

      expect(res.statusCode).toBe(404);
      expect(res._isEndCalled()).toBe(true);
    });
  });

  describe("DELETE", () => {
    it("deletes the requested image when called correctly", async () => {
      const id = 1234;
      const { req, res } = createMocks({
        method: "DELETE",
        query: {
          id: id.toString(),
        },
      });

      const session = {
        user: { role: Role.ADMIN },
      };
      mockGetServerSession.mockResolvedValueOnce(session);

      prismaMock.image.findUnique.mockResolvedValueOnce({} as any);

      await handler(
        req as unknown as NextApiRequest,
        res as unknown as NextApiResponse
      );

      expect(res.statusCode).toBe(200);
      expect(res._isEndCalled()).toBe(true);
      expect(prismaMock.image.delete).toBeCalledWith({ where: { id } });
    });

    it("returns a 401 unauthorized error if user is not authenticated", async () => {
      const { req, res } = createMocks({ method: "DELETE" });

      await handler(
        req as unknown as NextApiRequest,
        res as unknown as NextApiResponse
      );

      expect(res.statusCode).toBe(401);
      expect(res._isEndCalled()).toBe(true);
    });

    it("returns a 403 forbidden error if user is not admin", async () => {
      const { req, res } = createMocks({ method: "DELETE" });

      mockGetServerSession.mockResolvedValueOnce({
        user: { role: Role.PARTICIPANT },
      });

      await handler(
        req as unknown as NextApiRequest,
        res as unknown as NextApiResponse
      );

      expect(res.statusCode).toBe(403);
      expect(res._isEndCalled()).toBe(true);
    });
  });
});
