-- Generated from the connected PostgreSQL database.
-- Table: "public"."django_session"

CREATE TABLE "public"."django_session" (
    "session_key" character varying(40) NOT NULL,
    "session_data" text NOT NULL,
    "expire_date" timestamp with time zone NOT NULL,
    CONSTRAINT "django_session_pkey" PRIMARY KEY (session_key)
);

-- Indexes
CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);
CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);
