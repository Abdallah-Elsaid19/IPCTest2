-- Generated from the connected PostgreSQL database.
-- Table: "public"."clubs_clubenquiry"

CREATE TABLE "public"."clubs_clubenquiry" (
    "id" uuid NOT NULL,
    "email" character varying(254) NOT NULL,
    "message" text NOT NULL,
    "club_name" character varying(200) NOT NULL,
    "club_slug" character varying(200) NOT NULL,
    "page_url" character varying(500) NOT NULL,
    "status" character varying(20) NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    CONSTRAINT "clubs_clubenquiry_pkey" PRIMARY KEY (id)
);

-- Indexes
CREATE INDEX clubs_clube_club_sl_29fb61_idx ON public.clubs_clubenquiry USING btree (club_slug);
CREATE INDEX clubs_clube_email_538a91_idx ON public.clubs_clubenquiry USING btree (email);
CREATE INDEX clubs_clube_status_5f7ec9_idx ON public.clubs_clubenquiry USING btree (status, created_at);
CREATE INDEX clubs_clubenquiry_club_slug_28ad1d67 ON public.clubs_clubenquiry USING btree (club_slug);
CREATE INDEX clubs_clubenquiry_club_slug_28ad1d67_like ON public.clubs_clubenquiry USING btree (club_slug varchar_pattern_ops);
