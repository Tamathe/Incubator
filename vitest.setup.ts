import "dotenv/config";

process.env.JWT_SECRET ||= "test-secret-do-not-use-in-prod-min-32-chars-long-xx";
process.env.ADMIN_PASSWORD_HASH ||= "$2a$10$placeholder.hash.replaced.in.individual.tests.000000000000";
process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";
