--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: case_attachments; Type: TABLE DATA; Schema: public; Owner: records_user
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public.case_attachments DISABLE TRIGGER ALL;

COPY public.case_attachments (id, created_at, name, procedure_id, storage_path, type, uploaded_at) FROM stdin;
\.


ALTER TABLE public.case_attachments ENABLE TRIGGER ALL;

--
-- Data for Name: case_timeline_events; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.case_timeline_events DISABLE TRIGGER ALL;

COPY public.case_timeline_events (id, created_at, date, description, procedure_id, title) FROM stdin;
bcca91db-9c48-464c-889c-5e1eb1ccfa75	2026-05-19 20:06:26.691361+00	2026-05-19 20:06:26.687495+00	Se ha creado un nuevo expediente en estado borrador.	6c98b630-7ba1-497b-9b97-7dbbde3862ff	Expediente creado
f1590448-45eb-41b6-a59f-de79bd49991a	2026-05-19 20:06:26.88421+00	2026-05-19 20:06:26.882207+00	El ciudadano ha presentado el expediente.	6c98b630-7ba1-497b-9b97-7dbbde3862ff	Expediente enviado
3b6c41d7-8114-4913-8008-2a828b23de34	2026-05-19 20:38:32.641432+00	2026-05-19 20:38:32.638779+00	Se ha creado un nuevo expediente en estado borrador.	5f9109d5-b0c1-4ebd-806c-bfb40582fec0	Expediente creado
36e3fc33-ffe7-4bc0-9f08-31126287c331	2026-05-19 20:38:32.900882+00	2026-05-19 20:38:32.899179+00	El ciudadano ha presentado el expediente.	5f9109d5-b0c1-4ebd-806c-bfb40582fec0	Expediente enviado
161a99cc-49fb-41d8-9d49-c0640e35e3fd	2026-05-19 20:57:57.27767+00	2026-05-19 20:57:57.273052+00	El ciudadano ha presentado el expediente.	1739b330-5583-421a-8b38-d1285d26f8d7	Expediente enviado
81b1db78-9c91-4acd-bc80-16122d447293	2026-05-19 21:59:46.53564+00	2026-05-19 21:59:46.533674+00	Backoffice actualizo estado a: IN_REVIEW	1739b330-5583-421a-8b38-d1285d26f8d7	Cambio de estado
39ebbdc6-2655-4180-9da1-6f11dc64ca64	2026-05-19 21:59:58.584581+00	2026-05-19 21:59:58.583473+00	Backoffice actualizo estado a: APPROVED	5f9109d5-b0c1-4ebd-806c-bfb40582fec0	Cambio de estado
ffb94da6-92b1-415e-babb-b8b479b9de9d	2026-05-19 22:01:19.039993+00	2026-05-19 22:01:19.039274+00	Backoffice actualizo estado a: APPROVED	f5932298-9c65-412a-beac-6cfa0200088b	Cambio de estado
c7ab7887-985b-4d2a-9d17-aac60814000f	2026-05-20 13:53:45.799+00	2026-05-20 13:53:45.781191+00	Backoffice actualizo estado a: APPROVED	f5932298-9c65-412a-beac-6cfa0200088b	Cambio de estado
d66b3805-f4b0-46d5-95cf-fdfb0da43a8a	2026-05-20 13:53:54.70996+00	2026-05-20 13:53:54.708357+00	Backoffice actualizo estado a: APPROVED	f5932298-9c65-412a-beac-6cfa0200088b	Cambio de estado
eed85c4b-1b91-42b1-9c92-5eda11b10f65	2026-05-20 13:55:16.776556+00	2026-05-20 13:55:16.774456+00	Se ha creado un nuevo expediente en estado borrador.	4cfd2b5b-dc06-4431-b449-e226ccd157b8	Expediente creado
22a574ae-2c50-4502-bb28-7d6ce6523096	2026-05-20 13:55:17.14441+00	2026-05-20 13:55:17.142599+00	El ciudadano ha presentado el expediente.	4cfd2b5b-dc06-4431-b449-e226ccd157b8	Expediente enviado
9b0ad8c9-2416-45b1-981b-8d38ff2af834	2026-05-21 17:38:25.596824+00	2026-05-21 17:38:25.594473+00	Se ha creado un nuevo expediente en estado borrador.	67acb0a3-5ad8-4c71-bc16-56b3591aae6c	Expediente creado
5e5bd226-ee08-4635-a73d-b0e17ff97567	2026-05-21 17:38:25.692052+00	2026-05-21 17:38:25.690545+00	El ciudadano ha presentado el expediente.	67acb0a3-5ad8-4c71-bc16-56b3591aae6c	Expediente enviado
433a8789-dfc4-439c-85d1-2fa44182b037	2026-05-21 21:12:30.356135+00	2026-05-21 21:12:30.353273+00	Se ha creado un nuevo expediente en estado borrador.	3685f359-0e50-4ddc-8000-ffd302e13dd6	Expediente creado
6ee0d2a3-8f36-4a34-aa1f-95a42e54a6c3	2026-05-21 21:12:30.474851+00	2026-05-21 21:12:30.473461+00	El ciudadano ha presentado el expediente.	3685f359-0e50-4ddc-8000-ffd302e13dd6	Expediente enviado
2edbf3b7-3adf-451e-a434-a79d07a569a2	2026-05-21 21:22:09.033628+00	2026-05-21 21:22:09.031775+00	Backoffice actualizo estado a: APPROVED	6c98b630-7ba1-497b-9b97-7dbbde3862ff	Cambio de estado
a13e9e6c-9e8d-4d2e-a0a7-0a4c7ba5131b	2026-05-21 21:22:16.103784+00	2026-05-21 21:22:16.099821+00	Backoffice actualizo estado a: APPROVED	6c98b630-7ba1-497b-9b97-7dbbde3862ff	Cambio de estado
f8ed6dfc-03e8-4f50-b3fe-aa253d33e67b	2026-05-21 21:23:08.609061+00	2026-05-21 21:23:08.608348+00	Backoffice actualizo estado a: IN_REVIEW	3e9429d1-87b1-4772-b866-12a42f10c376	Cambio de estado
735cb9b0-18d8-4efa-a836-088f9e307b30	2026-05-21 21:23:12.595255+00	2026-05-21 21:23:12.591642+00	Backoffice actualizo estado a: APPROVED	3e9429d1-87b1-4772-b866-12a42f10c376	Cambio de estado
7ba30bb4-5649-4660-8515-913f94c9327d	2026-05-22 13:10:04.565268+00	2026-05-22 13:10:04.559454+00	Se ha creado un nuevo expediente en estado borrador.	2e7e3a88-5dc1-4eee-9205-244c26991f33	Expediente creado
415cec7e-c0b0-4fae-974b-fd2dada460de	2026-05-22 13:10:04.802232+00	2026-05-22 13:10:04.800579+00	El ciudadano ha presentado el expediente.	2e7e3a88-5dc1-4eee-9205-244c26991f33	Expediente enviado
85d3e031-0e4b-45a5-831f-8081ddd7009c	2026-05-22 13:24:17.514655+00	2026-05-22 13:24:17.510957+00	Se ha creado un nuevo expediente en estado borrador.	d022fe8a-379b-4241-9a9d-61fb42afe235	Expediente creado
dbc9db16-e898-443b-b56a-3cbe94972cd3	2026-05-22 13:24:17.642164+00	2026-05-22 13:24:17.639031+00	El ciudadano ha presentado el expediente.	d022fe8a-379b-4241-9a9d-61fb42afe235	Expediente enviado
7c9baf51-56cb-47eb-9de6-d7cdca325916	2026-05-22 13:33:23.146351+00	2026-05-22 13:33:23.141776+00	Backoffice actualizo estado a: REJECTED	d022fe8a-379b-4241-9a9d-61fb42afe235	Cambio de estado
933a88fa-d5b1-45e6-a456-eaffc1023d92	2026-05-22 14:08:34.783432+00	2026-05-22 14:08:34.780501+00	Backoffice actualizo estado a: IN_REVIEW	1739b330-5583-421a-8b38-d1285d26f8d7	Cambio de estado
dc449b7e-dadc-4671-ba47-0a204d6df237	2026-05-22 14:08:48.578277+00	2026-05-22 14:08:48.576955+00	Backoffice actualizo estado a: APPROVED	1739b330-5583-421a-8b38-d1285d26f8d7	Cambio de estado
77a233a9-862c-4937-8225-388bb706cc48	2026-05-22 15:39:51.996727+00	2026-05-22 15:39:51.993478+00	Se ha creado un nuevo expediente en estado borrador.	d586ef85-75c6-4795-adff-e7238a1b04bf	Expediente creado
08946d15-5d36-40fb-99ec-d2c42f8efe1a	2026-05-22 15:39:52.245502+00	2026-05-22 15:39:52.244322+00	El ciudadano ha presentado el expediente.	d586ef85-75c6-4795-adff-e7238a1b04bf	Expediente enviado
7dd02d57-2c40-4788-bc21-86f24750684d	2026-05-22 15:41:09.691009+00	2026-05-22 15:41:09.686957+00	Backoffice actualizo estado a: APPROVED	d586ef85-75c6-4795-adff-e7238a1b04bf	Cambio de estado
5690f59e-aa01-4b03-b09a-ae2202dff385	2026-05-25 19:24:56.958217+00	2026-05-25 19:24:56.95469+00	Se ha creado un nuevo expediente en estado borrador.	3e59e736-dde8-4989-b4f8-6222da999593	Expediente creado
d9c70a45-de4b-43a4-9220-c43e0806490a	2026-05-25 19:24:58.870345+00	2026-05-25 19:24:58.869264+00	El ciudadano ha presentado el expediente.	3e59e736-dde8-4989-b4f8-6222da999593	Expediente enviado
20b1ee16-53c0-4bf2-bee6-201fafc7c9a8	2026-05-25 19:37:22.720006+00	2026-05-25 19:37:22.718393+00	Backoffice actualizo estado a: APPROVED	3e59e736-dde8-4989-b4f8-6222da999593	Cambio de estado
0a30feff-73b9-4db8-a1b2-b295237c07c2	2026-05-25 19:37:27.845236+00	2026-05-25 19:37:27.844523+00	Backoffice actualizo estado a: APPROVED	3e59e736-dde8-4989-b4f8-6222da999593	Cambio de estado
c4ad71af-edf7-427a-98ea-d25374f57061	2026-05-25 20:08:21.319288+00	2026-05-25 20:08:21.314467+00	Se ha creado un nuevo expediente en estado borrador.	3ed5f752-1db0-4d28-a39d-48fe8399a49f	Expediente creado
230c9913-62ea-4e27-9d08-31ff4d45e8d4	2026-05-25 20:08:25.82536+00	2026-05-25 20:08:25.82338+00	El ciudadano ha presentado el expediente.	3ed5f752-1db0-4d28-a39d-48fe8399a49f	Expediente enviado
cbe0a217-c863-4e9a-9149-1730e723adad	2026-05-25 20:09:09.092533+00	2026-05-25 20:09:09.091255+00	Backoffice actualizo estado a: IN_REVIEW	3ed5f752-1db0-4d28-a39d-48fe8399a49f	Cambio de estado
64f3c1f3-b9b3-4c7b-9385-3af4e2cdd843	2026-05-25 20:09:12.512385+00	2026-05-25 20:09:12.511163+00	Backoffice actualizo estado a: APPROVED	3ed5f752-1db0-4d28-a39d-48fe8399a49f	Cambio de estado
49dca773-a44d-4cb8-adbf-e1cfe8044ed4	2026-05-25 20:09:19.113888+00	2026-05-25 20:09:19.109493+00	Backoffice actualizo estado a: IN_REVIEW	3ed5f752-1db0-4d28-a39d-48fe8399a49f	Cambio de estado
995b2264-4645-4ed3-a16e-a1b8bb2a0fee	2026-05-25 20:09:21.949568+00	2026-05-25 20:09:21.947289+00	Backoffice actualizo estado a: APPROVED	3ed5f752-1db0-4d28-a39d-48fe8399a49f	Cambio de estado
40101c99-6b40-4aa2-b378-3ceff3ff5b57	2026-05-25 20:27:49.488949+00	2026-05-25 20:27:49.484203+00	Se ha creado un nuevo expediente en estado borrador.	cfbf69e4-0c83-4028-bf61-c2d6c1042ef7	Expediente creado
92ebf032-491f-4571-a864-26759b0dfe28	2026-05-25 20:27:49.651975+00	2026-05-25 20:27:49.650225+00	El ciudadano ha presentado el expediente.	cfbf69e4-0c83-4028-bf61-c2d6c1042ef7	Expediente enviado
318f7f63-548a-415a-a405-5b7caa160094	2026-05-26 18:03:51.741825+00	2026-05-26 18:03:51.738114+00	Se ha creado un nuevo expediente en estado borrador.	63982e10-67bc-46c0-826e-3a8617bbe1b2	Expediente creado
cdcf7a08-dff7-4363-ab8f-b92e885795dc	2026-05-26 18:03:59.368834+00	2026-05-26 18:03:59.367131+00	Se ha creado un nuevo expediente en estado borrador.	b296b38d-9b12-48bf-97b3-cd5805eacef4	Expediente creado
805da71d-da9c-4c87-b16b-920aee6d79a6	2026-05-26 18:04:12.252648+00	2026-05-26 18:04:12.251303+00	Se ha creado un nuevo expediente en estado borrador.	460b41a8-2dab-4f46-b25d-4e57b04dbb95	Expediente creado
91911de8-661a-427b-819c-644962606842	2026-05-26 18:04:20.904288+00	2026-05-26 18:04:20.902665+00	Se ha creado un nuevo expediente en estado borrador.	1a454588-af2b-43a5-a1aa-78955d719015	Expediente creado
5356515f-e86f-40e7-808d-350c2519d265	2026-05-26 18:04:25.98881+00	2026-05-26 18:04:25.987386+00	Se ha creado un nuevo expediente en estado borrador.	304de5b2-de6a-40a3-8bbb-4918f2447fe4	Expediente creado
8c5dfda5-921d-47ad-9b03-88ae1004e827	2026-05-26 18:05:51.631666+00	2026-05-26 18:05:51.630671+00	Se ha creado un nuevo expediente en estado borrador.	86803896-20ff-4a32-bc58-4c34cb41bdf8	Expediente creado
22105742-99d9-40e6-a381-1f0ad717767b	2026-05-26 18:09:42.131276+00	2026-05-26 18:09:42.129584+00	Se ha creado un nuevo expediente en estado borrador.	64829354-ccc2-4c14-b4a0-76b639eb6a24	Expediente creado
d1c9dd60-475f-48a9-81dd-abeabdf40b1c	2026-05-26 18:16:53.320084+00	2026-05-26 18:16:53.317005+00	El ciudadano ha presentado el expediente.	64829354-ccc2-4c14-b4a0-76b639eb6a24	Expediente enviado
3710d7be-3aa4-4d9f-83d6-81b7fdac3d52	2026-05-26 18:19:22.777995+00	2026-05-26 18:19:22.775781+00	Se ha creado un nuevo expediente en estado borrador.	66294f37-ef97-497a-b172-68a072249bef	Expediente creado
81cc97d6-f1a3-44a3-b5e9-cc7819901f16	2026-05-26 18:19:23.358791+00	2026-05-26 18:19:23.357959+00	El ciudadano ha presentado el expediente.	66294f37-ef97-497a-b172-68a072249bef	Expediente enviado
8604ef21-ac01-4d73-acf2-6d7996a91dbf	2026-05-26 19:39:43.766508+00	2026-05-26 19:39:43.755174+00	Se ha creado un nuevo expediente en estado borrador.	08893ef5-adcc-46d0-962b-cb7cdfa512bd	Expediente creado
0a11ada5-89da-4c36-9969-78dcf5a52d74	2026-05-26 19:39:45.945338+00	2026-05-26 19:39:45.944192+00	El ciudadano ha presentado el expediente.	08893ef5-adcc-46d0-962b-cb7cdfa512bd	Expediente enviado
0e308dc1-7a46-4001-a63c-13906dad2532	2026-05-26 20:51:00.664832+00	2026-05-26 20:51:00.662221+00	Se ha creado un nuevo expediente en estado borrador.	d517f01f-cc9b-43a2-906b-c67ef2aa940b	Expediente creado
8039e713-0048-4fd9-b51f-c760f913b7e4	2026-05-26 20:51:01.508859+00	2026-05-26 20:51:01.507253+00	El ciudadano ha presentado el expediente.	d517f01f-cc9b-43a2-906b-c67ef2aa940b	Expediente enviado
3e554633-0249-486e-b41c-1928bdd333c1	2026-05-28 22:33:43.510892+00	2026-05-28 22:33:43.508921+00	Backoffice actualizo estado a: APPROVED	08893ef5-adcc-46d0-962b-cb7cdfa512bd	Cambio de estado
6dcc546a-6f21-4976-8466-9a82beba0e49	2026-06-02 20:41:43.379149+00	2026-06-02 20:41:43.363131+00	Se ha creado un nuevo expediente en estado borrador.	a2230e85-7c62-49db-863d-ec9cad24f439	Expediente creado
a12dcce3-11b8-4b6f-8865-c69c12933463	2026-06-02 20:41:45.674832+00	2026-06-02 20:41:45.67051+00	El ciudadano ha presentado el expediente.	a2230e85-7c62-49db-863d-ec9cad24f439	Expediente enviado
c968213e-221f-4d8b-87a5-9472f9963c8d	2026-06-02 22:01:35.273344+00	2026-06-02 22:01:35.268811+00	Se ha creado un nuevo expediente en estado borrador.	d217bfc8-c5fa-46fd-bed8-6997d63edf8c	Expediente creado
1093bf67-9bbf-496c-9f6c-25fc96a44d9f	2026-06-02 22:01:35.895681+00	2026-06-02 22:01:35.893585+00	El ciudadano ha presentado el expediente.	d217bfc8-c5fa-46fd-bed8-6997d63edf8c	Expediente enviado
83f11574-dd04-446a-9a24-5c70565498f7	2026-06-22 14:00:35.954705+00	2026-06-22 14:00:35.951741+00	Se ha creado un nuevo expediente en estado borrador.	80878b9f-5221-45a9-afc6-0f8a9b4396b1	Expediente creado
e7c4d908-753e-4a18-b1b7-e11a5fb37e3a	2026-06-22 14:00:36.425711+00	2026-06-22 14:00:36.424616+00	El ciudadano ha presentado el expediente.	80878b9f-5221-45a9-afc6-0f8a9b4396b1	Expediente enviado
41bfe8e3-3a32-4dba-90e5-b37ac0c64316	2026-06-22 14:11:09.578218+00	2026-06-22 14:11:09.576156+00	Backoffice actualizo estado a: APPROVED	80878b9f-5221-45a9-afc6-0f8a9b4396b1	Cambio de estado
bce8e13d-d29e-4033-889f-5726bc37e633	2026-06-22 14:11:16.033555+00	2026-06-22 14:11:16.032586+00	Backoffice actualizo estado a: APPROVED	80878b9f-5221-45a9-afc6-0f8a9b4396b1	Cambio de estado
\.


ALTER TABLE public.case_timeline_events ENABLE TRIGGER ALL;

--
-- Data for Name: cases; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.cases DISABLE TRIGGER ALL;

COPY public.cases (id, name) FROM stdin;
\.


ALTER TABLE public.cases ENABLE TRIGGER ALL;

--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.contact_messages DISABLE TRIGGER ALL;

COPY public.contact_messages (id, full_name, email, subject, message, category, is_read, read_at, created_at) FROM stdin;
44d35ab9-6ea0-4a9f-bc5f-22497edd9eb4	Fernando Castaño	fcastano.tsol@gmail.com	asdasdasdasd	sdsssssssssssssssssssssssssssssssss	\N	t	2026-05-20 15:44:42.787312+00	2026-05-20 15:20:12.296628+00
8c60eb03-5032-4ae9-a866-76fa5bf80a45	Fernando Castaño	fcastano.tsol@gmail.com	asaaaaaaaaaaaaaaaaaaaaaaa	aaaaaaaaaaaaaaaaaaaaaa	\N	t	2026-05-20 15:44:46.633879+00	2026-05-20 15:33:42.339455+00
cfa363b9-c308-4f05-9e36-0906022ae0cd	Fernando Castaño	fcastano.tsol@gmail.com	asdasdasdasd	dfffffffffffffffffffffffffffffffffff	\N	t	2026-05-20 15:45:04.302662+00	2026-05-20 15:21:18.105129+00
16d0abdc-13b3-4b71-8591-98624b4b872f	asdasd	fcastano.tsol@gmail.com	asdasd	asdasdasdasdasdsdfsfsd	\N	t	2026-05-21 21:08:34.823796+00	2026-05-21 20:58:12.979901+00
\.


ALTER TABLE public.contact_messages ENABLE TRIGGER ALL;

--
-- Data for Name: document_registry_counters; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.document_registry_counters DISABLE TRIGGER ALL;

COPY public.document_registry_counters (registry_type, unit_code, year, last_value) FROM stdin;
ENTRY	OFICINAD	2026	1
EXIT	OFICINAD	2026	1
ENTRY	PARQUESY	2026	1
EXIT	PARQUESY	2026	1
ENTRY	CONTRATA	2026	1
EXIT	CONTRATA	2026	1
ENTRY	UNIDADDE	2026	2
EXIT	UNIDADDE	2026	2
\.


ALTER TABLE public.document_registry_counters ENABLE TRIGGER ALL;

--
-- Data for Name: procedures; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.procedures DISABLE TRIGGER ALL;

COPY public.procedures (id, assigned_unit, created_at, form_data, owner_id, procedure_type_id, status, submitted_at, title, updated_at, process_instance_id, unit_code, record_number, entry_number) FROM stdin;
3ed5f752-1db0-4d28-a39d-48fe8399a49f	Unidad de Licencias	2026-05-25 20:08:21.247224+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fcastano.tsol@gmail.com","applicationReason":"asasdad","businessName":"Experience","premisesAddress":"Esta misma"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	APPROVED	2026-05-25 20:08:25.814273+00	Solicitud de Licencia	2026-05-25 20:09:21.950817+00	7d3c07a9-5875-11f1-8151-0242ac130004	UNIDADDE	\N	\N
d586ef85-75c6-4795-adff-e7238a1b04bf	Unidad de Licencias	2026-05-22 15:39:51.982151+00	{applicantFullName=Fernando Castaño, applicantEmail=fcastano.tsol@gmail.com, applicationReason=dadasd, businessName=Experience, premisesAddress=Esta misma}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	APPROVED	2026-05-22 15:39:52.240008+00	Solicitud de Licencia	2026-05-22 15:41:09.692459+00	79777986-55f4-11f1-9564-0242ac130004	UNIDADDE	\N	\N
5f9109d5-b0c1-4ebd-806c-bfb40582fec0	Unidad de Licencias	2026-05-19 20:38:32.615097+00	{applicantFullName=Fernando Castaño, applicantEmail=fcastano.tsol@gmail.com, applicationReason=sdfsdfsdfs, businessName=Experience, premisesAddress=Esta misma}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	APPROVED	2026-05-19 20:38:32.893848+00	Solicitud de Licencia	2026-05-19 21:59:58.585098+00	\N	UNIDADDE	\N	\N
f5932298-9c65-412a-beac-6cfa0200088b	\N	2026-05-19 20:04:01.520158+00	\N	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	ebeba1d1-ec1b-4a75-a494-f2d485243e65	APPROVED	2026-05-18 20:04:01.518663+00	Registry Certificate	2026-05-19 22:01:19.040479+00	\N	OFICINAD	\N	\N
4cfd2b5b-dc06-4431-b449-e226ccd157b8	Unidad de Licencias	2026-05-20 13:55:16.764445+00	{applicantFullName=Fernando Castaño, applicantEmail=fcastano.tsol@gmail.com, applicationReason=fasdasd, businessName=Experience, premisesAddress=Esta misma}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	SUBMITTED	2026-05-20 13:55:17.136679+00	Solicitud de Licencia	2026-05-20 13:55:17.138824+00	\N	UNIDADDE	\N	\N
67acb0a3-5ad8-4c71-bc16-56b3591aae6c	Unidad de Licencias	2026-05-21 17:38:25.588083+00	{applicantFullName=Fernando Castaño, applicantEmail=fcastano.tsol.1@gmail.com, applicationReason=aaaaaa, businessName=Experience, premisesAddress=Esta misma}	4a83bdd8-e96c-48e8-9b86-e2a872fc7747	a98135be-77fc-43f5-a6bf-e85ec5633ba5	SUBMITTED	2026-05-21 17:38:25.685808+00	Solicitud de Licencia	2026-05-21 17:38:25.687722+00	\N	UNIDADDE	\N	\N
3685f359-0e50-4ddc-8000-ffd302e13dd6	Unidad de Licencias	2026-05-21 21:12:30.341554+00	{applicantFullName=Hola, applicantEmail=fcastano.tsol@gmail.com, applicationReason=asdasdad, businessName=Experience, premisesAddress=Esta misma}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	SUBMITTED	2026-05-21 21:12:30.467648+00	Solicitud de Licencia	2026-05-21 21:12:30.469563+00	\N	UNIDADDE	\N	\N
6c98b630-7ba1-497b-9b97-7dbbde3862ff	Unidad de Licencias	2026-05-19 20:06:26.668603+00	{applicantFullName=Fernando Castaño, applicantEmail=fcastano.tsol@gmail.com, applicationReason=ASAsASAs, businessName=Experience, premisesAddress=Esta misma}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	APPROVED	2026-05-19 20:06:26.868151+00	Solicitud de Licencia	2026-05-21 21:22:09.037139+00	\N	UNIDADDE	\N	\N
3e59e736-dde8-4989-b4f8-6222da999593	Unidad de Licencias	2026-05-25 19:24:56.948351+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fcastano.tsol@gmail.com","applicationReason":"saaaaa","businessName":"Experience","premisesAddress":"Esta misma"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	APPROVED	2026-05-25 19:24:58.866428+00	Solicitud de Licencia	2026-05-25 19:37:22.721123+00	6b4823aa-586f-11f1-8dae-0242ac130004	UNIDADDE	\N	\N
3e9429d1-87b1-4772-b866-12a42f10c376	\N	2026-05-19 20:04:01.523983+00	\N	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	APPROVED	2026-05-17 20:04:01.522566+00	Address Update	2026-05-21 21:23:12.596371+00	\N	SERVICIO	\N	\N
2e7e3a88-5dc1-4eee-9205-244c26991f33	Unidad de Interoperabilidad	2026-05-22 13:10:04.548539+00	{documentationComplete=true, applicantFullName=Citizen Test}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	7fecfeac-761c-4549-ad36-e55d851cf0af	SUBMITTED	2026-05-22 13:10:04.794308+00	Tramitacion avanzada con validaciones ENS/ENI	2026-05-22 13:10:04.797226+00	\N	UNIDADDE	\N	\N
d022fe8a-379b-4241-9a9d-61fb42afe235	Unidad de Interoperabilidad	2026-05-22 13:24:17.496893+00	{}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	7fecfeac-761c-4549-ad36-e55d851cf0af	REJECTED	2026-05-22 13:24:17.633639+00	Tramitacion avanzada con validaciones ENS/ENI	2026-05-22 13:33:23.151439+00	\N	UNIDADDE	\N	\N
1739b330-5583-421a-8b38-d1285d26f8d7	\N	2026-05-19 20:04:01.509649+00	{applicantFullName=Fernando Castaño, applicantEmail=fcastano.tsol@gmail.com, applicationReason=sdfsdf, businessName=Experience, premisesAddress=Esta misma}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	APPROVED	2026-05-19 20:57:57.26319+00	License Application	2026-05-22 14:08:48.579927+00	\N	UNIDADDE	\N	\N
63982e10-67bc-46c0-826e-3a8617bbe1b2	Unidad de Licencias	2026-05-26 18:03:51.730969+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fcastano.tsol@gmail.com","applicationReason":"dfgdgdfg","businessName":"Experience","premisesAddress":"Esta misma"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	DRAFT	\N	Solicitud de Licencia	2026-05-26 18:03:51.730969+00	\N	UNIDADDE	\N	\N
b296b38d-9b12-48bf-97b3-cd5805eacef4	Unidad de Licencias	2026-05-26 18:03:59.357474+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fcastano.tsol@gmail.com","applicationReason":"dfgdgdfg","businessName":"Experience","premisesAddress":"Esta misma"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	DRAFT	\N	Solicitud de Licencia	2026-05-26 18:03:59.357474+00	\N	UNIDADDE	\N	\N
460b41a8-2dab-4f46-b25d-4e57b04dbb95	Unidad de Licencias	2026-05-26 18:04:12.241314+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fcastano.tsol@gmail.com","applicationReason":"dfgdgdfg","businessName":"Experience","premisesAddress":"Esta misma"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	DRAFT	\N	Solicitud de Licencia	2026-05-26 18:04:12.241314+00	\N	UNIDADDE	\N	\N
1a454588-af2b-43a5-a1aa-78955d719015	Unidad de Licencias	2026-05-26 18:04:20.898939+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fcastano.tsol@gmail.com","applicationReason":"dfgdgdfg","businessName":"Experience","premisesAddress":"Esta misma"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	DRAFT	\N	Solicitud de Licencia	2026-05-26 18:04:20.898939+00	\N	UNIDADDE	\N	\N
304de5b2-de6a-40a3-8bbb-4918f2447fe4	Unidad de Licencias	2026-05-26 18:04:25.984526+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fcastano.tsol@gmail.com","applicationReason":"dfgdgdfg","businessName":"Experience","premisesAddress":"Esta misma"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	DRAFT	\N	Solicitud de Licencia	2026-05-26 18:04:25.984526+00	\N	UNIDADDE	\N	\N
86803896-20ff-4a32-bc58-4c34cb41bdf8	Unidad de Licencias	2026-05-26 18:05:51.620105+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fcastano.tsol@gmail.com","applicationReason":"dfgdgdfg","businessName":"Experience","premisesAddress":"Esta misma"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	DRAFT	\N	Solicitud de Licencia	2026-05-26 18:05:51.620105+00	\N	UNIDADDE	\N	\N
cfbf69e4-0c83-4028-bf61-c2d6c1042ef7	Unidad de Licencias	2026-05-25 20:27:49.472525+00	{"applicantFullName":"Test Citizen","applicantEmail":"citizen@tfm.es","applicationReason":"Prueba numeracion expediente"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	SUBMITTED	2026-05-25 20:27:49.637917+00	Solicitud de Licencia	2026-05-25 20:27:49.974431+00	32e1e239-5878-11f1-8c14-0242ac130004	UNIDADDE	EXP/UNIDADDE/2026/000001	EXP/UNIDADDE/2026/000001
64829354-ccc2-4c14-b4a0-76b639eb6a24	Unidad de Licencias	2026-05-26 18:09:42.119371+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fcastano.tsol@gmail.com","applicationReason":"sdfsdf","businessName":"Experience","premisesAddress":"Esta misma"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	SUBMITTED	2026-05-26 18:16:53.301674+00	Solicitud de Licencia	2026-05-26 18:16:53.867402+00	129b52a3-592f-11f1-bc76-0242ac130005	UNIDADDE	EXP/UNIDADDE/2026/000002	EXP/UNIDADDE/2026/000002
66294f37-ef97-497a-b172-68a072249bef	Unidad de Licencias	2026-05-26 18:19:22.76581+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fcastano.tsol@gmail.com","applicationReason":"fghfgh","businessName":"Experience","premisesAddress":"Esta misma"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	SUBMITTED	2026-05-26 18:19:23.356693+00	Solicitud de Licencia	2026-05-26 18:19:23.413145+00	6be439df-592f-11f1-bc76-0242ac130005	UNIDADDE	EXP/UNIDADDE/2026/000003	EXP/UNIDADDE/2026/000003
d217bfc8-c5fa-46fd-bed8-6997d63edf8c	Contratación	2026-06-02 22:01:35.254549+00	{"field_1780437414784":"asdasd","field_1780437414960":"asdasd","field_1780437415144":"asdasd","field_1780437415329":"asdasd"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	2f829662-5031-4501-bfd3-b6e5d3f17224	SUBMITTED	2026-06-02 22:01:35.529249+00	asd	2026-06-02 22:01:36.168495+00	9fac5091-5ece-11f1-8117-0242ac170006	CONTRATA	EXP/CONTRATA/2026/000001	RE/CONTRATA/2026/000001
d517f01f-cc9b-43a2-906b-c67ef2aa940b	Parques y Jardines	2026-05-26 20:51:00.649243+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fcastano.tsol@gmail.com","applicationReason":"sssssssssss","treeLocation":"ssss","pruningJustification":"ssss"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	02801fa1-3a58-4ca2-b2f9-b22308d8ec22	SUBMITTED	2026-05-26 20:51:01.297342+00	Solicitud de Poda de Árboles	2026-05-26 20:51:01.68928+00	9adc415d-5944-11f1-a1b9-0242ac130006	PARQUESY	EXP/PARQUESY/2026/000001	RE/PARQUESY/2026/000001
08893ef5-adcc-46d0-962b-cb7cdfa512bd	Oficina del Registro	2026-05-26 19:39:43.526475+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fernando.castanotorres@gmail.com","applicationReason":"asdasd","certificateType":"padron","certificatePurpose":"asdasd"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	ebeba1d1-ec1b-4a75-a494-f2d485243e65	APPROVED	2026-05-26 19:39:45.469657+00	Certificado Registral	2026-05-28 22:33:43.516096+00	a682ef7e-593a-11f1-b2bf-0242ac130005	OFICINAD	EXP/OFICINAD/2026/000001	RE/OFICINAD/2026/000001
a2230e85-7c62-49db-863d-ec9cad24f439	Unidad de Licencias	2026-06-02 20:41:43.332662+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fcastano.tsol@gmail.com","applicationReason":"ssdfsdf","businessName":"Experience","premisesAddress":"Esta misma"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	SUBMITTED	2026-06-02 20:41:44.284985+00	Solicitud de Licencia	2026-06-02 20:41:47.074232+00	78ed7e8c-5ec3-11f1-a969-0242ac140006	UNIDADDE	EXP/UNIDADDE/2026/000004	RE/UNIDADDE/2026/000001
80878b9f-5221-45a9-afc6-0f8a9b4396b1	Unidad de Licencias	2026-06-22 14:00:35.943669+00	{"applicantFullName":"Fernando Castaño","applicantEmail":"fcastano.tsol@gmail.com","applicationReason":"asdasdasd","businessName":"Experience","premisesAddress":"Esta misma"}	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	a98135be-77fc-43f5-a6bf-e85ec5633ba5	APPROVED	2026-06-22 14:00:36.213901+00	Solicitud de Licencia	2026-06-22 14:11:09.579067+00	be538f5d-6e42-11f1-a5cf-0242ac180006	UNIDADDE	EXP/UNIDADDE/2026/000005	RE/UNIDADDE/2026/000002
\.


ALTER TABLE public.procedures ENABLE TRIGGER ALL;

--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.documents DISABLE TRIGGER ALL;

COPY public.documents (id, created_at, mime_type, name, size, status, storage_path, updated_at, uploaded_at, version, procedure_id, original_storage_path, signed_storage_path, original_mime_type, signed_mime_type, original_size, signed_size, signed_at, exit_number, generated, is_system_generated, entry_number) FROM stdin;
a7662145-aa54-4eca-b84b-a5af1a1e387d	2026-05-19 20:06:26.831006+00	application/pdf	justificante-ec1c9a0b-4889-4fca-b351-7788074df102.pdf	1260	PENDING	1093103d-a750-48b6-ad32-c3df376d39e9.pdf	2026-05-19 20:06:26.831006+00	2026-05-19 20:06:26.814063+00	1	6c98b630-7ba1-497b-9b97-7dbbde3862ff	1093103d-a750-48b6-ad32-c3df376d39e9.pdf	\N	application/pdf	\N	1260	\N	\N	\N	f	f	\N
d6f2ded1-4927-47fd-8676-d75893d68cad	2026-05-19 20:38:32.742881+00	application/pdf	justificante-ec1c9a0b-4889-4fca-b351-7788074df102.pdf	1260	PENDING	a2dd2339-e2d1-4c41-b153-78a3036f9b2e.pdf	2026-05-19 20:38:32.742881+00	2026-05-19 20:38:32.732531+00	1	5f9109d5-b0c1-4ebd-806c-bfb40582fec0	a2dd2339-e2d1-4c41-b153-78a3036f9b2e.pdf	\N	application/pdf	\N	1260	\N	\N	\N	f	f	\N
421a713b-9cce-46b2-aeaf-fa1111a05f1d	2026-05-19 20:57:57.032401+00	application/pdf	justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (1).pdf	1260	SIGNED	c9d3cf24-6fe6-4a73-b878-8bc005a6c670.pdf	2026-05-19 20:57:57.032401+00	2026-05-19 20:57:57.017582+00	1	1739b330-5583-421a-8b38-d1285d26f8d7	c9d3cf24-6fe6-4a73-b878-8bc005a6c670.pdf	\N	application/pdf	\N	1260	\N	\N	\N	f	f	\N
079f2957-c509-439a-b7aa-88c698f144ee	2026-05-19 21:21:03.202538+00	application/pdf	LFP - Manual Integración Abonados y Simpatizantes 2.4.36.0 y 2.5.13.0.pdf	2681612	PENDING	030951e5-9062-49aa-a6b3-ef5c67f6f6f6.pdf	2026-05-19 21:21:03.202538+00	2026-05-19 21:21:03.151826+00	1	f5932298-9c65-412a-beac-6cfa0200088b	030951e5-9062-49aa-a6b3-ef5c67f6f6f6.pdf	\N	application/pdf	\N	2681612	\N	\N	\N	f	f	\N
5f8d3038-2411-4de8-af95-f861ee315666	2026-05-19 21:36:41.546903+00	application/pdf	justificante-ec1c9a0b-4889-4fca-b351-7788074df102.pdf	6862	SIGNED	ea4e6695-c331-48f3-a6cb-5b020ffbdf38.pdf	2026-05-19 21:36:41.686304+00	2026-05-19 21:36:41.526413+00	1	f5932298-9c65-412a-beac-6cfa0200088b	ea4e6695-c331-48f3-a6cb-5b020ffbdf38.pdf	\N	application/pdf	\N	6862	\N	\N	\N	f	f	\N
542965d0-93e4-4ef0-a1fa-54984cccf9cb	2026-05-19 21:36:54.476172+00	image/png	2026-05-19_12-12.png	52802	SIGNED	990fe764-3378-4652-8024-878e224e1829.png	2026-05-19 21:36:54.667542+00	2026-05-19 21:36:54.469399+00	1	f5932298-9c65-412a-beac-6cfa0200088b	990fe764-3378-4652-8024-878e224e1829.png	\N	image/png	\N	52802	\N	\N	\N	f	f	\N
bf323418-793a-4b92-ac21-7c410c10ddd0	2026-05-19 21:57:16.447507+00	image/png	2026-05-19_12-12.png	52802	SIGNED	7158cde0-6b69-4955-a547-5aef47fb9836.png	2026-05-19 21:57:16.8132+00	2026-05-19 21:57:16.427066+00	1	f5932298-9c65-412a-beac-6cfa0200088b	7158cde0-6b69-4955-a547-5aef47fb9836.png	\N	image/png	\N	52802	\N	\N	\N	f	f	\N
6b655930-5efe-48af-8d41-1a5f71029629	2026-05-20 07:50:44.364865+00	application/pdf	justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (2).pdf	6862	PENDING	ded69a6a-5cc9-49d7-adf4-995f58c2f390.pdf	2026-05-20 07:50:44.364865+00	2026-05-20 07:50:44.330929+00	1	3e9429d1-87b1-4772-b866-12a42f10c376	ded69a6a-5cc9-49d7-adf4-995f58c2f390.pdf	\N	application/pdf	\N	6862	\N	\N	\N	f	f	\N
4fb5b13a-7e65-4075-b2a4-03bbdf3ce045	2026-05-20 13:55:16.930372+00	application/pdf	justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (2).pdf	23709	SIGNED	bf6b1736-67fb-4f98-abeb-85089389ce9c.pdf	2026-05-20 13:55:17.119217+00	2026-05-20 13:55:16.920365+00	1	4cfd2b5b-dc06-4431-b449-e226ccd157b8	bf6b1736-67fb-4f98-abeb-85089389ce9c.pdf	\N	application/pdf	\N	23709	\N	\N	\N	f	f	\N
68d1b0ac-5146-4d25-b5e2-e923acabb489	2026-05-21 17:38:45.864468+00	application/pdf	justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (2).pdf	23709	SIGNED	d3c936d4-c416-4eb8-8fc0-18efb624e7d2.pdf	2026-05-21 17:38:46.067543+00	2026-05-21 17:38:45.857241+00	1	67acb0a3-5ad8-4c71-bc16-56b3591aae6c	d3c936d4-c416-4eb8-8fc0-18efb624e7d2.pdf	\N	application/pdf	\N	23709	\N	\N	\N	f	f	\N
eae67c04-412c-4a6c-869f-945e7f2f4b9a	2026-05-21 21:22:48.003395+00	application/pdf	justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (2).pdf	6862	PENDING	49e4d839-d0e9-4e3c-b4a8-9719a47c5887.pdf	2026-05-21 21:22:48.003395+00	2026-05-21 21:22:47.997438+00	1	3e9429d1-87b1-4772-b866-12a42f10c376	49e4d839-d0e9-4e3c-b4a8-9719a47c5887.pdf	\N	application/pdf	\N	6862	\N	\N	\N	f	f	\N
800832bd-5701-428a-b712-556b1be57e27	2026-05-22 14:06:47.538339+00	application/pdf	justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (2).pdf	23709	SIGNED	9982d037-596c-4303-bbea-16ef04238d5b.pdf	2026-05-22 14:06:47.72387+00	2026-05-22 14:06:47.501516+00	1	1739b330-5583-421a-8b38-d1285d26f8d7	9982d037-596c-4303-bbea-16ef04238d5b.pdf	\N	application/pdf	\N	23709	\N	\N	\N	f	f	\N
051daa45-f331-4b23-8f00-728faffdbd9a	2026-05-22 15:39:52.130016+00	application/pdf	justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (1) (1).pdf	1267	SIGNED	d5783722-e70c-49e9-8d40-2146b9308410.pdf	2026-05-22 15:39:52.237055+00	2026-05-22 15:39:52.115743+00	1	d586ef85-75c6-4795-adff-e7238a1b04bf	d5783722-e70c-49e9-8d40-2146b9308410.pdf	\N	application/pdf	\N	1267	\N	\N	\N	f	f	\N
701a9bc3-d8b2-41ed-9968-9609c296590f	2026-05-25 19:24:57.122411+00	application/pdf	LFP - Manual Integración Abonados y Simpatizantes 2.4.36.0 y 2.5.13.0 (1).pdf	8069362	SIGNED	657630c9-0af2-4f79-8ca3-64296f2e4976.pdf	2026-05-25 19:24:58.818031+00	2026-05-25 19:24:57.110297+00	1	3e59e736-dde8-4989-b4f8-6222da999593	6b4d8cc0-c6c7-41b2-9999-5919c3b02264.pdf	657630c9-0af2-4f79-8ca3-64296f2e4976.pdf	application/pdf	application/pdf	2681612	8069362	2026-05-25 19:24:58.814903	\N	f	f	\N
6beac9d2-6a7c-42ff-90f2-c6cc540cb198	2026-05-25 20:08:21.610981+00	application/pdf	LFP - Manual Integración Abonados y Simpatizantes 2.4.36.0 y 2.5.13.0 (1).pdf	8069362	SIGNED	103f3364-076f-4f6c-872a-34e87b6e7e4b.pdf	2026-05-25 20:08:25.707792+00	2026-05-25 20:08:21.590226+00	1	3ed5f752-1db0-4d28-a39d-48fe8399a49f	1ec85269-0d02-4fbe-b35f-75a4b850e1cf.pdf	103f3364-076f-4f6c-872a-34e87b6e7e4b.pdf	application/pdf	application/pdf	2681612	8069362	2026-05-25 20:08:25.702688	\N	f	f	\N
231aef06-14c6-4061-9e21-e55661fdb6de	2026-05-26 18:16:52.010742+00	application/pdf	RBB_2027_CampanaAbonos_landing.pdf	1202321	SIGNED	8624885f-2621-403c-9003-6e3a7346d9f0.pdf	2026-05-26 18:16:53.867832+00	2026-05-26 18:16:51.979092+00	1	64829354-ccc2-4c14-b4a0-76b639eb6a24	1e3e2696-5b79-4afe-9248-f221b9964c52.pdf	8624885f-2621-403c-9003-6e3a7346d9f0.pdf	application/pdf	application/pdf	398687	1202321	2026-05-26 18:16:53.260607	\N	f	f	\N
629089af-59cc-4729-9031-fbe71d0f0612	2026-05-26 18:19:22.851116+00	application/pdf	RBB_2027_CampanaAbonos_landing.pdf	1202321	SIGNED	a37c048c-d94b-45f6-9061-d70b5fec76df.pdf	2026-05-26 18:19:23.413459+00	2026-05-26 18:19:22.847489+00	1	66294f37-ef97-497a-b172-68a072249bef	747a9000-8fd1-4b6c-8e3d-2960228789fe.pdf	a37c048c-d94b-45f6-9061-d70b5fec76df.pdf	application/pdf	application/pdf	398687	1202321	2026-05-26 18:19:23.345976	\N	f	f	\N
93001aa3-ae47-42ae-924f-14bcd9dfe75f	2026-05-26 18:20:09.442926+00	application/pdf	RBB_2027_CampanaAbonos_landing.pdf	3619657	SIGNED	d3e7a273-b37d-4831-b203-ff364e27d93d.pdf	2026-05-26 18:20:10.214682+00	2026-05-26 18:20:09.437228+00	1	66294f37-ef97-497a-b172-68a072249bef	e66bd104-9172-4eba-96cf-b2b1901294a0.pdf	d3e7a273-b37d-4831-b203-ff364e27d93d.pdf	application/pdf	application/pdf	1202321	3619657	2026-05-26 18:20:10.21272	\N	f	f	\N
de855678-ae88-4cca-a7f5-32af4579e9e1	2026-05-26 19:39:44.085785+00	application/pdf	RBB_2027_CampanaAbonos_landing.pdf	1202321	SIGNED	c55a195b-6368-4b86-8ea3-d996dc1d09a4.pdf	2026-05-26 19:39:45.47721+00	2026-05-26 19:39:44.070541+00	1	08893ef5-adcc-46d0-962b-cb7cdfa512bd	717278b6-e6cc-4d83-b1b6-ddaad0f86f50.pdf	c55a195b-6368-4b86-8ea3-d996dc1d09a4.pdf	application/pdf	application/pdf	398687	1202321	2026-05-26 19:39:45.41364	\N	f	f	\N
b0d89cd2-4b9b-42ac-a0f1-b3bfe0a7b982	2026-05-26 19:39:45.934829+00	application/pdf	Documento Resumen del Expediente.pdf	7303	SIGNED	c60e5d0b-c78b-4a0b-8fcd-e5658cea111a.pdf	2026-05-26 19:39:45.934829+00	2026-05-26 19:39:45.930852+00	1	08893ef5-adcc-46d0-962b-cb7cdfa512bd	\N	c60e5d0b-c78b-4a0b-8fcd-e5658cea111a.pdf	\N	application/pdf	\N	7303	2026-05-26 19:39:45.93084	RS/OFICINAD/2026/000001	t	f	\N
9e829f23-f837-4902-9672-34b51735847a	2026-06-02 20:41:45.598223+00	application/pdf	Documento Resumen del Expediente.pdf	7632	SIGNED	07a8b94c-6c3d-418a-b2b5-43cbaa62b23a.pdf	2026-06-02 20:41:45.598223+00	2026-06-02 20:41:45.592955+00	1	a2230e85-7c62-49db-863d-ec9cad24f439	\N	07a8b94c-6c3d-418a-b2b5-43cbaa62b23a.pdf	\N	application/pdf	\N	7632	2026-06-02 20:41:45.592951	RS/UNIDADDE/2026/000001	t	f	\N
b97d2c12-867d-469f-8f11-50e2077dcd9f	2026-05-26 20:51:00.783927+00	application/pdf	RBB_2027_CampanaAbonos_landing.pdf	800339	SIGNED	f1c7104f-57e8-4c03-916e-7ffaee89815b.pdf	2026-05-26 20:51:01.302606+00	2026-05-26 20:51:00.777612+00	1	d517f01f-cc9b-43a2-906b-c67ef2aa940b	25d02ede-07ae-435e-b22b-b367c4261d53.pdf	f1c7104f-57e8-4c03-916e-7ffaee89815b.pdf	application/pdf	application/pdf	398687	800339	2026-05-26 20:51:01.264699	\N	f	f	RE/PARQUESY/2026/000001
a706c7b7-ca89-4e29-b1ff-9d3b4a5dd211	2026-05-26 20:51:01.500065+00	application/pdf	Documento Resumen del Expediente.pdf	7518	SIGNED	cec7e068-7ef5-4076-a38a-e679cf6c30c6.pdf	2026-05-26 20:51:01.500065+00	2026-05-26 20:51:01.497983+00	1	d517f01f-cc9b-43a2-906b-c67ef2aa940b	\N	cec7e068-7ef5-4076-a38a-e679cf6c30c6.pdf	\N	application/pdf	\N	7518	2026-05-26 20:51:01.497981	RS/PARQUESY/2026/000001	t	f	\N
b465ca23-8300-4fb8-b0da-0a0494bc3146	2026-05-26 20:55:19.673741+00	application/pdf	Revisión_GSE_ConsultoríaPackaging_ed3_0.pdf	1430628	SIGNED	b19bfe0b-beda-49fd-a0ac-02081ede02dc.pdf	2026-05-26 20:55:20.919838+00	2026-05-26 20:55:19.667917+00	1	d517f01f-cc9b-43a2-906b-c67ef2aa940b	bcce0343-9cdb-4898-9bde-a47aa27c0714.pdf	b19bfe0b-beda-49fd-a0ac-02081ede02dc.pdf	application/pdf	application/pdf	713202	1430628	2026-05-26 20:55:20.913123	\N	f	f	\N
2127acdf-0993-4ba1-a973-502bb1387663	2026-06-02 20:41:43.927929+00	image/png	screencapture-localhost-4300-admin-procedures-2026-06-02-22_40_03.png	288445	PENDING	6a5888ae-61b2-4d83-ad5c-0e9a64b3ca0a.png	2026-06-02 20:41:44.299487+00	2026-06-02 20:41:43.864201+00	1	a2230e85-7c62-49db-863d-ec9cad24f439	6a5888ae-61b2-4d83-ad5c-0e9a64b3ca0a.png	\N	image/png	\N	288445	\N	\N	\N	f	f	RE/UNIDADDE/2026/000001
b6440363-0677-4c53-8cd0-94a43e984c5f	2026-06-02 22:01:35.437397+00	image/png	screencapture-localhost-4300-admin-procedures-2026-06-02-22_40_03.png	288445	PENDING	b918a56e-c730-4787-824c-be9db27dd710.png	2026-06-02 22:01:35.534409+00	2026-06-02 22:01:35.419334+00	1	d217bfc8-c5fa-46fd-bed8-6997d63edf8c	b918a56e-c730-4787-824c-be9db27dd710.png	\N	image/png	\N	288445	\N	\N	\N	f	f	RE/CONTRATA/2026/000001
2220dd0e-ab09-48d1-97ae-290e53cbef8f	2026-06-02 22:01:35.878566+00	application/pdf	Documento Resumen del Expediente.pdf	7299	SIGNED	06a66b01-b8c3-4562-885d-dcc4245d089d.pdf	2026-06-02 22:01:35.878566+00	2026-06-02 22:01:35.876439+00	1	d217bfc8-c5fa-46fd-bed8-6997d63edf8c	\N	06a66b01-b8c3-4562-885d-dcc4245d089d.pdf	\N	application/pdf	\N	7299	2026-06-02 22:01:35.876424	RS/CONTRATA/2026/000001	t	f	\N
14cd07c9-4ee5-4397-b75b-1279a1d82899	2026-06-22 14:00:36.062828+00	application/pdf	estatutos.pdf	79385	SIGNED	f359739d-d20f-4711-9ff3-0ba7bf6ced8d.pdf	2026-06-22 14:00:36.218917+00	2026-06-22 14:00:36.048432+00	1	80878b9f-5221-45a9-afc6-0f8a9b4396b1	96d7bd21-b8bc-4550-bc99-4d5bc6905ee9.pdf	f359739d-d20f-4711-9ff3-0ba7bf6ced8d.pdf	application/pdf	application/pdf	25211	79385	2026-06-22 14:00:36.184193	\N	f	f	RE/UNIDADDE/2026/000002
8aba8150-f267-4fd5-af58-c72850c1369e	2026-06-22 14:00:36.418879+00	application/pdf	Documento Resumen del Expediente.pdf	7497	SIGNED	f8f6c2ce-3a7a-4d8b-85d5-3f1e3544989c.pdf	2026-06-22 14:00:36.418879+00	2026-06-22 14:00:36.417666+00	1	80878b9f-5221-45a9-afc6-0f8a9b4396b1	\N	f8f6c2ce-3a7a-4d8b-85d5-3f1e3544989c.pdf	\N	application/pdf	\N	7497	2026-06-22 14:00:36.417664	RS/UNIDADDE/2026/000002	t	f	\N
\.


ALTER TABLE public.documents ENABLE TRIGGER ALL;

--
-- Data for Name: document_verifications; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.document_verifications DISABLE TRIGGER ALL;

COPY public.document_verifications (id, document_id, csv_code, signed_digest, signed_at, created_at) FROM stdin;
db17cd22-707e-499a-89d3-40506d65d9da	701a9bc3-d8b2-41ed-9968-9609c296590f	5022C23264917B9997FC	7ac5de6235b6aeda16c66263d775a689853da33ab003c2787efae11562dbf70b	2026-05-25 19:24:58.814903	2026-05-25 19:24:58.83592
243cc231-dfa0-4e15-a9cf-297006c6bb28	6beac9d2-6a7c-42ff-90f2-c6cc540cb198	5E11305BEDB6FF908233	0f322ee6dbf62f0719bd32047e63ae3e0029314f8fbae30c9f04cdbdbabc56d5	2026-05-25 20:08:25.702688	2026-05-25 20:08:25.740585
c549f3f7-e6b2-464a-b038-f16e2bda1188	231aef06-14c6-4061-9e21-e55661fdb6de	4459D93F7F59AF17E60F	8dbc34ea4d2456fe6848eb9391784b84c850202d17e8e59803f2aa16063cc929	2026-05-26 18:16:53.260607	2026-05-26 18:16:53.287444
52f23b2b-27d3-4562-9415-88ebe52d0109	629089af-59cc-4729-9031-fbe71d0f0612	F4B7FAFBF23F2A152432	c1191c874c160b9523b9e5ec01f65a0f66afda8c52889d02404a8f1656a011a6	2026-05-26 18:19:23.345976	2026-05-26 18:19:23.352195
6763ed95-2e51-472f-a02c-83c4611cde9f	93001aa3-ae47-42ae-924f-14bcd9dfe75f	7C597380ECBBAB7C3F0B	5b14d1be6a8f77a39e492077914a0a666c88686c05370bc3cbcc30dc0730ca04	2026-05-26 18:20:10.21272	2026-05-26 18:20:10.226446
1b20a08f-9311-4d94-b8b9-d7c196108fac	de855678-ae88-4cca-a7f5-32af4579e9e1	FF1DF7928CA57CE3AE35	a864818c86c161479ee71975488577c4ce4ff3dc1de5ce88e0e8660e9ec361b4	2026-05-26 19:39:45.41364	2026-05-26 19:39:45.433943
fc404fb9-a8e4-4635-a2f6-ceedd5d16f55	b0d89cd2-4b9b-42ac-a0f1-b3bfe0a7b982	F52846C305B78929AB58	378bae1bffa26c298bc3a21b7b1956e2fabf64864a7bd21ce7efa0b8951f10d1	2026-05-26 19:39:45.93084	2026-05-26 19:39:45.942267
2bf8a511-a7bb-4d90-9da1-f95296af636e	b97d2c12-867d-469f-8f11-50e2077dcd9f	AE8907F4D55930ECD0E4	16e0e24305212c1ee474a63b73e14febfdb33c487726773e9371d34b30136ec2	2026-05-26 20:51:01.264699	2026-05-26 20:51:01.273692
2211a7ad-01ac-4a29-815d-36bbb6273ecb	a706c7b7-ca89-4e29-b1ff-9d3b4a5dd211	50C353DF2AC947F04E74	f9222f15b5658f30e14a1c39941e71b097d065121d4bdffee500c2aec6e14304	2026-05-26 20:51:01.497981	2026-05-26 20:51:01.506005
f2e41a64-facb-4183-8d38-7db1a7aa79a2	b465ca23-8300-4fb8-b0da-0a0494bc3146	F29B6192F63ECBD04CC2	b0ff3983affa038e90bb8c84e1fb44742a809caab945d01d471ce7e810e20620	2026-05-26 20:55:20.913123	2026-05-26 20:55:20.933959
8ff18e07-d079-41a2-a308-a2f6aefa131e	9e829f23-f837-4902-9672-34b51735847a	3B31CDB1C2DA1B9E8F2C	d133e10d2f163d7984ee7e5a08c884f4323038f2df129e5f5668ecddb8b045d1	2026-06-02 20:41:45.592951	2026-06-02 20:41:45.655663
c44f706c-9c05-41a0-b1ea-a1007d85fb38	2220dd0e-ab09-48d1-97ae-290e53cbef8f	1DE7F9FBCD7D93B2929B	0a6ff12e13c9512331ac41482e80571a4b9f8791b67ddfbd34839e45d57cc0bd	2026-06-02 22:01:35.876424	2026-06-02 22:01:35.891136
e977752d-8df8-4f0e-ae5e-8c2a928531ac	14cd07c9-4ee5-4397-b75b-1279a1d82899	F70A3379B1178D6ADBE5	ff20aca9e93e97212f1f53588f8081d7eb9ae2274a81fa44399ab2fbf08647e8	2026-06-22 14:00:36.184193	2026-06-22 14:00:36.196404
345762d9-a4c1-4ff8-b514-487880594d2c	8aba8150-f267-4fd5-af58-c72850c1369e	A49769F4A5A27228343F	460c917401e7d7e08805e94b8fcdc555ad5f5e132a39091857a5812a1f879b5a	2026-06-22 14:00:36.417664	2026-06-22 14:00:36.423326
\.


ALTER TABLE public.document_verifications ENABLE TRIGGER ALL;

--
-- Data for Name: eni_metadata; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.eni_metadata DISABLE TRIGGER ALL;

COPY public.eni_metadata (id, created_at, metadata_json, resource_id, resource_type, updated_at) FROM stdin;
e86499b6-79f1-4e3e-a113-1ef9b1c54aee	2026-05-19 20:06:26.846212+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"a7662145-aa54-4eca-b84b-a5af1a1e387d","procedureId":"6c98b630-7ba1-497b-9b97-7dbbde3862ff","name":"justificante-ec1c9a0b-4889-4fca-b351-7788074df102.pdf","mimeType":"application/pdf","size":1260,"version":1,"status":"PENDING","uploadedAt":"2026-05-19T20:06:26.814062836Z","createdAt":"2026-05-19T20:06:26.831005768Z","updatedAt":"2026-05-19T20:06:26.831005768Z"}	a7662145-aa54-4eca-b84b-a5af1a1e387d	DOCUMENT	2026-05-19 20:06:26.846212+00
cc9fe401-4e48-44cd-b6fa-b738f6af6af4	2026-05-19 20:06:26.716117+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"6c98b630-7ba1-497b-9b97-7dbbde3862ff","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":"2026-05-19T20:06:26.868150550Z","createdAt":null,"updatedAt":"2026-05-19T20:06:26.869717082Z"}	6c98b630-7ba1-497b-9b97-7dbbde3862ff	PROCEDURE	2026-05-19 20:06:26.88982+00
a964e029-8fcb-4d1b-a611-837d2f81295a	2026-05-19 20:38:32.753183+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"d6f2ded1-4927-47fd-8676-d75893d68cad","procedureId":"5f9109d5-b0c1-4ebd-806c-bfb40582fec0","name":"justificante-ec1c9a0b-4889-4fca-b351-7788074df102.pdf","mimeType":"application/pdf","size":1260,"version":1,"status":"PENDING","uploadedAt":"2026-05-19T20:38:32.732531492Z","createdAt":"2026-05-19T20:38:32.742880967Z","updatedAt":"2026-05-19T20:38:32.742880967Z"}	d6f2ded1-4927-47fd-8676-d75893d68cad	DOCUMENT	2026-05-19 20:38:32.753183+00
0d76d876-173a-4b2d-af42-a0ca89a62488	2026-05-19 20:38:32.655838+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"5f9109d5-b0c1-4ebd-806c-bfb40582fec0","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":"2026-05-19T20:38:32.893847539Z","createdAt":null,"updatedAt":"2026-05-19T20:38:32.895425859Z"}	5f9109d5-b0c1-4ebd-806c-bfb40582fec0	PROCEDURE	2026-05-19 20:38:32.906954+00
376f2b76-872a-4f3b-9905-21be3ae11f51	2026-05-19 20:57:57.055913+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"421a713b-9cce-46b2-aeaf-fa1111a05f1d","procedureId":"1739b330-5583-421a-8b38-d1285d26f8d7","name":"justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (1).pdf","mimeType":"application/pdf","size":1260,"version":1,"status":"PENDING","uploadedAt":"2026-05-19T20:57:57.017582442Z","createdAt":"2026-05-19T20:57:57.032400926Z","updatedAt":"2026-05-19T20:57:57.032400926Z"}	421a713b-9cce-46b2-aeaf-fa1111a05f1d	DOCUMENT	2026-05-19 20:57:57.055913+00
438932b1-4fa6-4c10-94fa-5b17c47a27da	2026-05-19 20:57:56.905893+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"1739b330-5583-421a-8b38-d1285d26f8d7","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"License Application","assignedUnit":null,"submittedAt":"2026-05-19T20:57:57.263190208Z","createdAt":null,"updatedAt":"2026-05-19T20:57:57.269696499Z"}	1739b330-5583-421a-8b38-d1285d26f8d7	PROCEDURE	2026-05-19 20:57:57.288792+00
aae8fb70-e8dd-488b-8c86-848aced28379	2026-05-19 21:21:03.26404+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"079f2957-c509-439a-b7aa-88c698f144ee","procedureId":"f5932298-9c65-412a-beac-6cfa0200088b","name":"LFP - Manual Integración Abonados y Simpatizantes 2.4.36.0 y 2.5.13.0.pdf","mimeType":"application/pdf","size":2681612,"version":1,"status":"PENDING","uploadedAt":"2026-05-19T21:21:03.151825752Z","createdAt":"2026-05-19T21:21:03.202538301Z","updatedAt":"2026-05-19T21:21:03.202538301Z"}	079f2957-c509-439a-b7aa-88c698f144ee	DOCUMENT	2026-05-19 21:21:03.26404+00
9ea6415b-7623-4cfa-a2ac-d20cfd71cef9	2026-05-19 21:36:41.589666+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"5f8d3038-2411-4de8-af95-f861ee315666","procedureId":"f5932298-9c65-412a-beac-6cfa0200088b","name":"justificante-ec1c9a0b-4889-4fca-b351-7788074df102.pdf","mimeType":"application/pdf","size":1260,"version":1,"status":"PENDING","uploadedAt":"2026-05-19T21:36:41.526413417Z","createdAt":"2026-05-19T21:36:41.546903255Z","updatedAt":"2026-05-19T21:36:41.546903255Z"}	5f8d3038-2411-4de8-af95-f861ee315666	DOCUMENT	2026-05-19 21:36:41.589666+00
713315b3-cbb4-4703-9781-b0ac8f44af1d	2026-05-19 21:36:54.496782+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"542965d0-93e4-4ef0-a1fa-54984cccf9cb","procedureId":"f5932298-9c65-412a-beac-6cfa0200088b","name":"2026-05-19_12-12.png","mimeType":"image/png","size":52795,"version":1,"status":"PENDING","uploadedAt":"2026-05-19T21:36:54.469398678Z","createdAt":"2026-05-19T21:36:54.476172475Z","updatedAt":"2026-05-19T21:36:54.476172475Z"}	542965d0-93e4-4ef0-a1fa-54984cccf9cb	DOCUMENT	2026-05-19 21:36:54.496782+00
4714387b-1b1a-4b07-9be4-e73469266485	2026-05-19 21:57:16.484827+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"bf323418-793a-4b92-ac21-7c410c10ddd0","procedureId":"f5932298-9c65-412a-beac-6cfa0200088b","name":"2026-05-19_12-12.png","mimeType":"image/png","size":52795,"version":1,"status":"PENDING","uploadedAt":"2026-05-19T21:57:16.427066158Z","createdAt":"2026-05-19T21:57:16.447506917Z","updatedAt":"2026-05-19T21:57:16.447506917Z"}	bf323418-793a-4b92-ac21-7c410c10ddd0	DOCUMENT	2026-05-19 21:57:16.484827+00
79f22914-6f08-4c68-a67b-b9993f8f2463	2026-05-20 07:50:44.416986+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"6b655930-5efe-48af-8d41-1a5f71029629","procedureId":"3e9429d1-87b1-4772-b866-12a42f10c376","name":"justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (2).pdf","mimeType":"application/pdf","size":6862,"version":1,"status":"PENDING","uploadedAt":"2026-05-20T07:50:44.330928924Z","createdAt":"2026-05-20T07:50:44.364864734Z","updatedAt":"2026-05-20T07:50:44.364864734Z"}	6b655930-5efe-48af-8d41-1a5f71029629	DOCUMENT	2026-05-20 07:50:44.416986+00
8abf5f92-e242-456c-b0a1-b9a9209c0396	2026-05-20 13:55:16.946397+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"4fb5b13a-7e65-4075-b2a4-03bbdf3ce045","procedureId":"4cfd2b5b-dc06-4431-b449-e226ccd157b8","name":"justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (2).pdf","mimeType":"application/pdf","size":6862,"version":1,"status":"PENDING","uploadedAt":"2026-05-20T13:55:16.920364835Z","createdAt":"2026-05-20T13:55:16.930372383Z","updatedAt":"2026-05-20T13:55:16.930372383Z"}	4fb5b13a-7e65-4075-b2a4-03bbdf3ce045	DOCUMENT	2026-05-20 13:55:16.946397+00
835698cb-9240-4e88-83dc-e87e063308c4	2026-05-20 13:55:16.79105+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"4cfd2b5b-dc06-4431-b449-e226ccd157b8","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":"2026-05-20T13:55:17.136678567Z","createdAt":null,"updatedAt":"2026-05-20T13:55:17.138824399Z"}	4cfd2b5b-dc06-4431-b449-e226ccd157b8	PROCEDURE	2026-05-20 13:55:17.150813+00
72cb279a-892d-4447-a570-16610d1f43a9	2026-05-21 17:38:25.617561+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"67acb0a3-5ad8-4c71-bc16-56b3591aae6c","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"4a83bdd8-e96c-48e8-9b86-e2a872fc7747","status":"SUBMITTED","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":"2026-05-21T17:38:25.685807790Z","createdAt":null,"updatedAt":"2026-05-21T17:38:25.687722362Z"}	67acb0a3-5ad8-4c71-bc16-56b3591aae6c	PROCEDURE	2026-05-21 17:38:25.700322+00
ca0d2d82-5235-4525-9d36-12fc7076d813	2026-05-21 17:38:45.893237+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"68d1b0ac-5146-4d25-b5e2-e923acabb489","procedureId":"67acb0a3-5ad8-4c71-bc16-56b3591aae6c","name":"justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (2).pdf","mimeType":"application/pdf","size":6862,"version":1,"status":"PENDING","uploadedAt":"2026-05-21T17:38:45.857241318Z","createdAt":"2026-05-21T17:38:45.864467635Z","updatedAt":"2026-05-21T17:38:45.864467635Z"}	68d1b0ac-5146-4d25-b5e2-e923acabb489	DOCUMENT	2026-05-21 17:38:45.893237+00
f3ba4226-563f-4d80-a93b-77d9b5c74daa	2026-05-21 21:12:30.369345+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"3685f359-0e50-4ddc-8000-ffd302e13dd6","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":"2026-05-21T21:12:30.467647975Z","createdAt":null,"updatedAt":"2026-05-21T21:12:30.469563469Z"}	3685f359-0e50-4ddc-8000-ffd302e13dd6	PROCEDURE	2026-05-21 21:12:30.480869+00
2b332629-f3e9-471c-8425-13c0a72e877e	2026-05-21 21:22:48.023588+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"eae67c04-412c-4a6c-869f-945e7f2f4b9a","procedureId":"3e9429d1-87b1-4772-b866-12a42f10c376","name":"justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (2).pdf","mimeType":"application/pdf","size":6862,"version":1,"status":"PENDING","uploadedAt":"2026-05-21T21:22:47.997438385Z","createdAt":"2026-05-21T21:22:48.003394514Z","updatedAt":"2026-05-21T21:22:48.003394514Z"}	eae67c04-412c-4a6c-869f-945e7f2f4b9a	DOCUMENT	2026-05-21 21:22:48.023588+00
84e2da17-66e1-4af1-85f3-5ab28f1dbdaa	2026-05-22 13:10:04.592741+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"2e7e3a88-5dc1-4eee-9205-244c26991f33","procedureTypeId":"7fecfeac-761c-4549-ad36-e55d851cf0af","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Tramitacion avanzada con validaciones ENS/ENI","assignedUnit":"Unidad de Interoperabilidad","submittedAt":"2026-05-22T13:10:04.794307639Z","createdAt":null,"updatedAt":"2026-05-22T13:10:04.797226449Z"}	2e7e3a88-5dc1-4eee-9205-244c26991f33	PROCEDURE	2026-05-22 13:10:05.014034+00
da527ab0-4a6a-44a0-9bb7-491340e38a33	2026-05-22 13:24:17.530419+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"d022fe8a-379b-4241-9a9d-61fb42afe235","procedureTypeId":"7fecfeac-761c-4549-ad36-e55d851cf0af","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Tramitacion avanzada con validaciones ENS/ENI","assignedUnit":"Unidad de Interoperabilidad","submittedAt":"2026-05-22T13:24:17.633638920Z","createdAt":null,"updatedAt":"2026-05-22T13:24:17.635969532Z"}	d022fe8a-379b-4241-9a9d-61fb42afe235	PROCEDURE	2026-05-22 13:24:17.982982+00
18e5cf85-4bda-49ee-b2a2-772f99729862	2026-05-22 14:06:47.609253+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"800832bd-5701-428a-b712-556b1be57e27","procedureId":"1739b330-5583-421a-8b38-d1285d26f8d7","name":"justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (2).pdf","mimeType":"application/pdf","size":6862,"version":1,"status":"PENDING","uploadedAt":"2026-05-22T14:06:47.501515878Z","createdAt":"2026-05-22T14:06:47.538339354Z","updatedAt":"2026-05-22T14:06:47.538339354Z"}	800832bd-5701-428a-b712-556b1be57e27	DOCUMENT	2026-05-22 14:06:47.609253+00
95af3362-bd56-4f49-8a40-b53a6850978d	2026-05-22 15:39:52.139839+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"051daa45-f331-4b23-8f00-728faffdbd9a","procedureId":"d586ef85-75c6-4795-adff-e7238a1b04bf","name":"justificante-ec1c9a0b-4889-4fca-b351-7788074df102 (1) (1).pdf","mimeType":"application/pdf","size":1260,"version":1,"status":"PENDING","uploadedAt":"2026-05-22T15:39:52.115743422Z","createdAt":"2026-05-22T15:39:52.130016140Z","updatedAt":"2026-05-22T15:39:52.130016140Z"}	051daa45-f331-4b23-8f00-728faffdbd9a	DOCUMENT	2026-05-22 15:39:52.139839+00
2780dc1f-ecbc-460f-a0cb-5229012ee1b8	2026-05-22 15:39:52.009327+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"d586ef85-75c6-4795-adff-e7238a1b04bf","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":"2026-05-22T15:39:52.240007520Z","createdAt":null,"updatedAt":"2026-05-22T15:39:52.241933659Z"}	d586ef85-75c6-4795-adff-e7238a1b04bf	PROCEDURE	2026-05-22 15:39:52.430168+00
c7b472ba-ef47-4dde-a9cb-f4cc35505690	2026-05-25 19:24:57.132733+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"701a9bc3-d8b2-41ed-9968-9609c296590f","procedureId":"3e59e736-dde8-4989-b4f8-6222da999593","name":"LFP - Manual Integración Abonados y Simpatizantes 2.4.36.0 y 2.5.13.0 (1).pdf","mimeType":"application/pdf","size":2681612,"version":1,"status":"PENDING","uploadedAt":"2026-05-25T19:24:57.110297486Z","createdAt":"2026-05-25T19:24:57.122410860Z","updatedAt":"2026-05-25T19:24:57.122410860Z"}	701a9bc3-d8b2-41ed-9968-9609c296590f	DOCUMENT	2026-05-25 19:24:57.132733+00
e3ed7af1-bb4b-45c3-8432-41f282ee044a	2026-05-25 19:24:56.973314+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"3e59e736-dde8-4989-b4f8-6222da999593","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":"2026-05-25T19:24:58.866428055Z","createdAt":null,"updatedAt":"2026-05-25T19:24:58.867567865Z"}	3e59e736-dde8-4989-b4f8-6222da999593	PROCEDURE	2026-05-25 19:24:59.083973+00
0290bb12-0035-483a-bfc1-01a31216b054	2026-05-25 20:08:21.635963+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"6beac9d2-6a7c-42ff-90f2-c6cc540cb198","procedureId":"3ed5f752-1db0-4d28-a39d-48fe8399a49f","name":"LFP - Manual Integración Abonados y Simpatizantes 2.4.36.0 y 2.5.13.0 (1).pdf","mimeType":"application/pdf","size":2681612,"version":1,"status":"PENDING","uploadedAt":"2026-05-25T20:08:21.590226249Z","createdAt":"2026-05-25T20:08:21.610981096Z","updatedAt":"2026-05-25T20:08:21.610981096Z"}	6beac9d2-6a7c-42ff-90f2-c6cc540cb198	DOCUMENT	2026-05-25 20:08:21.635963+00
ac5244c0-3e42-4a32-973e-2517d87f21b6	2026-05-25 20:08:21.343915+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"3ed5f752-1db0-4d28-a39d-48fe8399a49f","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":"2026-05-25T20:08:25.814273200Z","createdAt":null,"updatedAt":"2026-05-25T20:08:25.817826629Z"}	3ed5f752-1db0-4d28-a39d-48fe8399a49f	PROCEDURE	2026-05-25 20:08:26.193674+00
05df8806-d18f-4bec-bf6d-be53471b8b4d	2026-05-25 20:27:49.511213+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"cfbf69e4-0c83-4028-bf61-c2d6c1042ef7","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":"2026-05-25T20:27:49.637916691Z","createdAt":null,"updatedAt":null}	cfbf69e4-0c83-4028-bf61-c2d6c1042ef7	PROCEDURE	2026-05-25 20:27:49.975068+00
254634d0-1ff7-487c-884a-9f9d5c4942a6	2026-05-26 18:03:51.755013+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"63982e10-67bc-46c0-826e-3a8617bbe1b2","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"DRAFT","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":null,"createdAt":"2026-05-26T18:03:51.730968720Z","updatedAt":"2026-05-26T18:03:51.730968720Z"}	63982e10-67bc-46c0-826e-3a8617bbe1b2	PROCEDURE	2026-05-26 18:03:51.755013+00
8e72f1d8-f85a-4675-a76d-59c7108c3347	2026-05-26 18:03:59.374442+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"b296b38d-9b12-48bf-97b3-cd5805eacef4","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"DRAFT","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":null,"createdAt":"2026-05-26T18:03:59.357474282Z","updatedAt":"2026-05-26T18:03:59.357474282Z"}	b296b38d-9b12-48bf-97b3-cd5805eacef4	PROCEDURE	2026-05-26 18:03:59.374442+00
37470e15-bdd4-4b42-9498-528b4e2b088c	2026-05-26 18:04:12.258501+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"460b41a8-2dab-4f46-b25d-4e57b04dbb95","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"DRAFT","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":null,"createdAt":"2026-05-26T18:04:12.241314192Z","updatedAt":"2026-05-26T18:04:12.241314192Z"}	460b41a8-2dab-4f46-b25d-4e57b04dbb95	PROCEDURE	2026-05-26 18:04:12.258501+00
475eba07-b438-42a1-8c5d-268d90c8f2a0	2026-05-26 18:04:20.911509+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"1a454588-af2b-43a5-a1aa-78955d719015","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"DRAFT","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":null,"createdAt":"2026-05-26T18:04:20.898939460Z","updatedAt":"2026-05-26T18:04:20.898939460Z"}	1a454588-af2b-43a5-a1aa-78955d719015	PROCEDURE	2026-05-26 18:04:20.911509+00
3ac15878-635b-4467-bd25-eec6e2f17358	2026-05-26 18:09:42.13925+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"64829354-ccc2-4c14-b4a0-76b639eb6a24","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":"2026-05-26T18:16:53.301674032Z","createdAt":null,"updatedAt":null}	64829354-ccc2-4c14-b4a0-76b639eb6a24	PROCEDURE	2026-05-26 18:16:53.870262+00
c7356a7f-9046-4ba5-8dbb-8b2f83314065	2026-05-26 18:04:25.996789+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"304de5b2-de6a-40a3-8bbb-4918f2447fe4","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"DRAFT","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":null,"createdAt":"2026-05-26T18:04:25.984525837Z","updatedAt":"2026-05-26T18:04:25.984525837Z"}	304de5b2-de6a-40a3-8bbb-4918f2447fe4	PROCEDURE	2026-05-26 18:04:25.996789+00
4b9e72cd-b17e-4947-90d1-961255b7bbab	2026-05-26 18:05:51.635879+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"86803896-20ff-4a32-bc58-4c34cb41bdf8","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"DRAFT","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":null,"createdAt":"2026-05-26T18:05:51.620105120Z","updatedAt":"2026-05-26T18:05:51.620105120Z"}	86803896-20ff-4a32-bc58-4c34cb41bdf8	PROCEDURE	2026-05-26 18:05:51.635879+00
3ebc2237-a448-4738-85d8-67f7c2f2ffac	2026-05-26 18:16:52.03229+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"231aef06-14c6-4061-9e21-e55661fdb6de","procedureId":"64829354-ccc2-4c14-b4a0-76b639eb6a24","name":"RBB_2027_CampanaAbonos_landing.pdf","mimeType":"application/pdf","size":398687,"version":1,"status":"PENDING","uploadedAt":"2026-05-26T18:16:51.979092065Z","createdAt":"2026-05-26T18:16:52.010741599Z","updatedAt":"2026-05-26T18:16:52.010741599Z"}	231aef06-14c6-4061-9e21-e55661fdb6de	DOCUMENT	2026-05-26 18:16:52.03229+00
53571085-3131-4018-ab93-707c248334dc	2026-05-26 18:19:22.858981+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"629089af-59cc-4729-9031-fbe71d0f0612","procedureId":"66294f37-ef97-497a-b172-68a072249bef","name":"RBB_2027_CampanaAbonos_landing.pdf","mimeType":"application/pdf","size":398687,"version":1,"status":"PENDING","uploadedAt":"2026-05-26T18:19:22.847488930Z","createdAt":"2026-05-26T18:19:22.851116274Z","updatedAt":"2026-05-26T18:19:22.851116274Z"}	629089af-59cc-4729-9031-fbe71d0f0612	DOCUMENT	2026-05-26 18:19:22.858981+00
233cc828-95f6-4663-b9e4-0214214360e5	2026-05-26 18:19:22.783841+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"66294f37-ef97-497a-b172-68a072249bef","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":"2026-05-26T18:19:23.356693013Z","createdAt":null,"updatedAt":null}	66294f37-ef97-497a-b172-68a072249bef	PROCEDURE	2026-05-26 18:19:23.413835+00
9d6653ed-e877-40d0-a8b2-27c94ff13855	2026-05-26 18:20:09.463767+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"93001aa3-ae47-42ae-924f-14bcd9dfe75f","procedureId":"66294f37-ef97-497a-b172-68a072249bef","name":"RBB_2027_CampanaAbonos_landing.pdf","mimeType":"application/pdf","size":1202321,"version":1,"status":"PENDING","uploadedAt":"2026-05-26T18:20:09.437227602Z","createdAt":"2026-05-26T18:20:09.442926440Z","updatedAt":"2026-05-26T18:20:09.442926440Z"}	93001aa3-ae47-42ae-924f-14bcd9dfe75f	DOCUMENT	2026-05-26 18:20:09.463767+00
97de7187-dfda-49d8-b63c-a3c5bdf05b5d	2026-05-26 19:39:44.117184+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"de855678-ae88-4cca-a7f5-32af4579e9e1","procedureId":"08893ef5-adcc-46d0-962b-cb7cdfa512bd","name":"RBB_2027_CampanaAbonos_landing.pdf","mimeType":"application/pdf","size":398687,"version":1,"status":"PENDING","uploadedAt":"2026-05-26T19:39:44.070541245Z","createdAt":"2026-05-26T19:39:44.085785375Z","updatedAt":"2026-05-26T19:39:44.085785375Z"}	de855678-ae88-4cca-a7f5-32af4579e9e1	DOCUMENT	2026-05-26 19:39:44.117184+00
9d9dcaed-d0b1-49f5-aa06-951555c5ffec	2026-05-26 19:39:43.803273+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"08893ef5-adcc-46d0-962b-cb7cdfa512bd","procedureTypeId":"ebeba1d1-ec1b-4a75-a494-f2d485243e65","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Certificado Registral","assignedUnit":"Oficina del Registro","submittedAt":"2026-05-26T19:39:45.469656539Z","createdAt":null,"updatedAt":null}	08893ef5-adcc-46d0-962b-cb7cdfa512bd	PROCEDURE	2026-05-26 19:39:46.343305+00
8d34e6ed-cbb4-4b97-b965-c2f63147979c	2026-05-26 20:51:00.80828+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"b97d2c12-867d-469f-8f11-50e2077dcd9f","procedureId":"d517f01f-cc9b-43a2-906b-c67ef2aa940b","name":"RBB_2027_CampanaAbonos_landing.pdf","mimeType":"application/pdf","size":398687,"version":1,"status":"PENDING","uploadedAt":"2026-05-26T20:51:00.777612140Z","createdAt":"2026-05-26T20:51:00.783926825Z","updatedAt":"2026-05-26T20:51:00.783926825Z"}	b97d2c12-867d-469f-8f11-50e2077dcd9f	DOCUMENT	2026-05-26 20:51:00.80828+00
b6beea3e-142f-4540-9c5f-15077dbc85f4	2026-05-26 20:51:00.679753+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"d517f01f-cc9b-43a2-906b-c67ef2aa940b","procedureTypeId":"02801fa1-3a58-4ca2-b2f9-b22308d8ec22","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Solicitud de Poda de Árboles","assignedUnit":"Parques y Jardines","submittedAt":"2026-05-26T20:51:01.297342344Z","createdAt":null,"updatedAt":null}	d517f01f-cc9b-43a2-906b-c67ef2aa940b	PROCEDURE	2026-05-26 20:51:01.689694+00
6f097013-1e50-4640-9f3b-b0fae1ca69f4	2026-05-26 20:55:19.683142+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"b465ca23-8300-4fb8-b0da-0a0494bc3146","procedureId":"d517f01f-cc9b-43a2-906b-c67ef2aa940b","name":"Revisión_GSE_ConsultoríaPackaging_ed3_0.pdf","mimeType":"application/pdf","size":713202,"version":1,"status":"PENDING","uploadedAt":"2026-05-26T20:55:19.667917485Z","createdAt":"2026-05-26T20:55:19.673741392Z","updatedAt":"2026-05-26T20:55:19.673741392Z"}	b465ca23-8300-4fb8-b0da-0a0494bc3146	DOCUMENT	2026-05-26 20:55:19.683142+00
0a1bf21d-4bba-4250-8f99-e7fcee7680f5	2026-06-02 20:41:43.985209+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"2127acdf-0993-4ba1-a973-502bb1387663","procedureId":"a2230e85-7c62-49db-863d-ec9cad24f439","name":"screencapture-localhost-4300-admin-procedures-2026-06-02-22_40_03.png","mimeType":"image/png","size":288445,"version":1,"status":"PENDING","uploadedAt":"2026-06-02T20:41:43.864200966Z","createdAt":"2026-06-02T20:41:43.927929481Z","updatedAt":"2026-06-02T20:41:43.927929481Z"}	2127acdf-0993-4ba1-a973-502bb1387663	DOCUMENT	2026-06-02 20:41:43.985209+00
a7bce682-d12c-4bec-9805-9d4b801452ea	2026-06-02 20:41:43.440981+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"a2230e85-7c62-49db-863d-ec9cad24f439","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":"2026-06-02T20:41:44.284985125Z","createdAt":null,"updatedAt":null}	a2230e85-7c62-49db-863d-ec9cad24f439	PROCEDURE	2026-06-02 20:41:47.078642+00
9a9a8da5-ce0b-434e-8d21-95ffc2fec124	2026-06-02 22:01:35.453401+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"b6440363-0677-4c53-8cd0-94a43e984c5f","procedureId":"d217bfc8-c5fa-46fd-bed8-6997d63edf8c","name":"screencapture-localhost-4300-admin-procedures-2026-06-02-22_40_03.png","mimeType":"image/png","size":288445,"version":1,"status":"PENDING","uploadedAt":"2026-06-02T22:01:35.419333826Z","createdAt":"2026-06-02T22:01:35.437396641Z","updatedAt":"2026-06-02T22:01:35.437396641Z"}	b6440363-0677-4c53-8cd0-94a43e984c5f	DOCUMENT	2026-06-02 22:01:35.453401+00
c240dbcf-c0aa-4d12-9745-9d059ebc94c5	2026-06-02 22:01:35.289724+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"d217bfc8-c5fa-46fd-bed8-6997d63edf8c","procedureTypeId":"2f829662-5031-4501-bfd3-b6e5d3f17224","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"asd","assignedUnit":"Contratación","submittedAt":"2026-06-02T22:01:35.529249487Z","createdAt":null,"updatedAt":null}	d217bfc8-c5fa-46fd-bed8-6997d63edf8c	PROCEDURE	2026-06-02 22:01:36.16891+00
4a15951f-4626-4e08-877c-6457c1ad4012	2026-06-22 14:00:36.074186+00	{"eniVersion":"ENI-NTI-2011","resourceType":"DOCUMENT","documentId":"14cd07c9-4ee5-4397-b75b-1279a1d82899","procedureId":"80878b9f-5221-45a9-afc6-0f8a9b4396b1","name":"estatutos.pdf","mimeType":"application/pdf","size":25211,"version":1,"status":"PENDING","uploadedAt":"2026-06-22T14:00:36.048431697Z","createdAt":"2026-06-22T14:00:36.062827943Z","updatedAt":"2026-06-22T14:00:36.062827943Z"}	14cd07c9-4ee5-4397-b75b-1279a1d82899	DOCUMENT	2026-06-22 14:00:36.074186+00
4f89fd59-7818-46a9-bb62-71530747d737	2026-06-22 14:00:35.967375+00	{"eniVersion":"ENI-NTI-2011","resourceType":"PROCEDURE","procedureId":"80878b9f-5221-45a9-afc6-0f8a9b4396b1","procedureTypeId":"a98135be-77fc-43f5-a6bf-e85ec5633ba5","ownerId":"3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c","status":"SUBMITTED","title":"Solicitud de Licencia","assignedUnit":"Unidad de Licencias","submittedAt":"2026-06-22T14:00:36.213901467Z","createdAt":null,"updatedAt":null}	80878b9f-5221-45a9-afc6-0f8a9b4396b1	PROCEDURE	2026-06-22 14:00:36.618999+00
\.


ALTER TABLE public.eni_metadata ENABLE TRIGGER ALL;

--
-- Data for Name: flw_channel_definition; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.flw_channel_definition DISABLE TRIGGER ALL;

COPY public.flw_channel_definition (id_, name_, version_, key_, category_, deployment_id_, create_time_, tenant_id_, resource_name_, description_, type_, implementation_) FROM stdin;
\.


ALTER TABLE public.flw_channel_definition ENABLE TRIGGER ALL;

--
-- Data for Name: flw_ev_databasechangelog; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.flw_ev_databasechangelog DISABLE TRIGGER ALL;

COPY public.flw_ev_databasechangelog (id, author, filename, dateexecuted, orderexecuted, exectype, md5sum, description, comments, tag, liquibase, contexts, labels, deployment_id) FROM stdin;
1	flowable	org/flowable/eventregistry/db/liquibase/flowable-eventregistry-db-changelog.xml	2026-05-19 19:26:03.473041	1	EXECUTED	9:63268f536c469325acef35970312551b	createTable tableName=FLW_EVENT_DEPLOYMENT; createTable tableName=FLW_EVENT_RESOURCE; createTable tableName=FLW_EVENT_DEFINITION; createIndex indexName=ACT_IDX_EVENT_DEF_UNIQ, tableName=FLW_EVENT_DEFINITION; createTable tableName=FLW_CHANNEL_DEFIN...		\N	4.29.2	\N	\N	9218763285
2	flowable	org/flowable/eventregistry/db/liquibase/flowable-eventregistry-db-changelog.xml	2026-05-19 19:26:03.499302	2	EXECUTED	9:dcb58b7dfd6dbda66939123a96985536	addColumn tableName=FLW_CHANNEL_DEFINITION; addColumn tableName=FLW_CHANNEL_DEFINITION		\N	4.29.2	\N	\N	9218763285
3	flowable	org/flowable/eventregistry/db/liquibase/flowable-eventregistry-db-changelog.xml	2026-05-19 19:26:03.624866	3	EXECUTED	9:d0c05678d57af23ad93699991e3bf4f6	customChange		\N	4.29.2	\N	\N	9218763285
\.


ALTER TABLE public.flw_ev_databasechangelog ENABLE TRIGGER ALL;

--
-- Data for Name: flw_ev_databasechangeloglock; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.flw_ev_databasechangeloglock DISABLE TRIGGER ALL;

COPY public.flw_ev_databasechangeloglock (id, locked, lockgranted, lockedby) FROM stdin;
1	f	\N	\N
\.


ALTER TABLE public.flw_ev_databasechangeloglock ENABLE TRIGGER ALL;

--
-- Data for Name: flw_event_definition; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.flw_event_definition DISABLE TRIGGER ALL;

COPY public.flw_event_definition (id_, name_, version_, key_, category_, deployment_id_, tenant_id_, resource_name_, description_) FROM stdin;
\.


ALTER TABLE public.flw_event_definition ENABLE TRIGGER ALL;

--
-- Data for Name: flw_event_deployment; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.flw_event_deployment DISABLE TRIGGER ALL;

COPY public.flw_event_deployment (id_, name_, category_, deploy_time_, tenant_id_, parent_deployment_id_) FROM stdin;
\.


ALTER TABLE public.flw_event_deployment ENABLE TRIGGER ALL;

--
-- Data for Name: flw_event_resource; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.flw_event_resource DISABLE TRIGGER ALL;

COPY public.flw_event_resource (id_, name_, deployment_id_, resource_bytes_) FROM stdin;
\.


ALTER TABLE public.flw_event_resource ENABLE TRIGGER ALL;

--
-- Data for Name: flw_ru_batch; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.flw_ru_batch DISABLE TRIGGER ALL;

COPY public.flw_ru_batch (id_, rev_, type_, search_key_, search_key2_, create_time_, complete_time_, status_, batch_doc_id_, tenant_id_) FROM stdin;
\.


ALTER TABLE public.flw_ru_batch ENABLE TRIGGER ALL;

--
-- Data for Name: flw_ru_batch_part; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.flw_ru_batch_part DISABLE TRIGGER ALL;

COPY public.flw_ru_batch_part (id_, rev_, batch_id_, type_, scope_id_, sub_scope_id_, scope_type_, search_key_, search_key2_, create_time_, complete_time_, status_, result_doc_id_, tenant_id_) FROM stdin;
\.


ALTER TABLE public.flw_ru_batch_part ENABLE TRIGGER ALL;

--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.flyway_schema_history DISABLE TRIGGER ALL;

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	3	<< Flyway Baseline >>	BASELINE	<< Flyway Baseline >>	\N	records_user	2026-05-20 06:28:18.597238	0	t
2	4	create messaging tables	SQL	V4__create_messaging_tables.sql	304438806	records_user	2026-05-20 06:28:18.775635	39	t
3	5	create contact messages table	SQL	V5__create_contact_messages_table.sql	-2074969472	records_user	2026-05-20 15:18:50.241554	38	t
4	6	add last login to users	SQL	V6__add_last_login_to_users.sql	1665311755	records_user	2026-05-21 17:29:00.137771	12	t
5	7	add security token columns	SQL	V7__add_security_token_columns.sql	-885698727	records_user	2026-05-22 10:03:07.029559	111	t
6	8	add process key to procedure types	SQL	V8__add_process_key_to_procedure_types.sql	2024560442	records_user	2026-05-22 13:09:10.223502	79	t
7	9	add process instance id to procedures	SQL	V9__add_process_instance_id_to_procedures.sql	-719505269	records_user	2026-05-22 14:06:04.285825	22	t
8	10	add original and signed document artifacts	SQL	V10__add_original_and_signed_document_artifacts.sql	-1914831370	records_user	2026-05-24 22:04:26.813674	106	t
9	11	create document verifications table	SQL	V11__create_document_verifications_table.sql	1972078859	records_user	2026-05-24 22:04:27.149276	59	t
10	12	add business record numbering	SQL	V12__add_business_record_numbering.sql	-685806267	records_user	2026-05-25 20:25:48.878417	69	t
11	13	add entry exit numbering	SQL	V13__add_entry_exit_numbering.sql	368401054	records_user	2026-05-26 19:36:08.797033	87	t
12	14	add entry number to documents	SQL	V14__add_entry_number_to_documents.sql	-647554776	records_user	2026-05-26 20:47:54.259728	36	t
13	15	create formal notifications tables	SQL	V15__create_formal_notifications_tables.sql	249514510	records_user	2026-05-28 20:14:45.3845	79	t
\.


ALTER TABLE public.flyway_schema_history ENABLE TRIGGER ALL;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.users DISABLE TRIGGER ALL;

COPY public.users (id, active, address, created_at, display_name, email, last_verification_email_sent_at, national_id, otp_code, otp_expiry, password_hash, phone, updated_at, last_login, verification_token, verification_token_expiry, password_reset_token, password_reset_expiry, refresh_token_hash) FROM stdin;
c0f909dd-f96b-4f75-80e2-c947dee7ce7b	f	\N	2026-05-20 16:38:30.416431+00	Fernando Castaño	fcastano.tsol@gmail.com	2026-05-20 16:38:30.40758+00	28640477A	677198	2026-05-21 16:38:30.407575+00	$2a$12$kKEG.REMoABZxO6gMF3J3eubxiyMRpLJHbT72QPCKjIQjsXL7akfO	672220391	2026-05-20 16:38:30.416431+00	\N	\N	\N	\N	\N	\N
ab3122ba-ab30-40b1-9c6e-15f23ac30b96	f	Test Street 1	2026-05-20 16:57:19.542571+00	Mailpit Test	mailpit-test-1779296237@example.com	2026-05-20 16:57:19.440328+00	12345678Z	193411	2026-05-21 16:57:19.440312+00	$2a$12$AW/fVY0liTByr6qH5xJLpekTO.Eyyo6EbI8b0nvRYH7atk0B2gfoy	600123456	2026-05-20 16:57:19.542571+00	\N	\N	\N	\N	\N	\N
3068c439-cf23-4919-8be3-401d6e764bc4	f	Test Street 3	2026-05-20 17:03:39.531922+00	Mailpit Test	mailpit-test-1779296618@example.com	2026-05-20 17:03:39.426774+00	12345677Y	087928	2026-05-21 17:03:39.426758+00	$2a$12$anQXrYn8/2PPos9QzspSHeVG14kxT2Th25WpCvWtg0d1UUesj09Y6	600123456	2026-05-20 17:03:39.531922+00	\N	\N	\N	\N	\N	\N
4a83bdd8-e96c-48e8-9b86-e2a872fc7747	t	Esta misma	2026-05-20 17:12:32.080678+00	Fernando Castaño	fcastano.tsol.1@gmail.com	2026-05-20 17:12:32.044731+00	00000000T	\N	\N	$2a$12$g50mWS0n6chq0Ah27z/I5ugUCutMCFWr4E6GkMWDA2EBSvMvBmnV2	672220391	2026-05-21 17:37:31.070094+00	2026-05-21 17:37:31.064267+00	\N	\N	\N	\N	\N
81151e14-514b-4b0e-8afb-d9353a48807a	t	\N	2026-05-19 20:03:59.716458+00	Test Admin	admin@tfm.es	\N	\N	\N	\N	$2a$12$PfPQ8NEmk2yAcdZYuw2K2OFJBsygVRiDIlMhGOsV.rm8z91qUYkqW	\N	2026-06-22 17:37:12.861645+00	2026-06-22 14:06:56.317197+00	\N	\N	\N	\N	5c828713e8aa6ce470c5dcb7a38a839efe48130e9362bc4da477cfd615e98a6c
3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	t	Esta misma, 234, 234	2026-05-19 20:03:59.022147+00	Test Citizen	citizen@tfm.es	\N	28640477A	\N	\N	$2a$12$umoka3/BKvNUGcLiMFg4SeRtYo4JmwRh7v6mtR.1DzKKx31nLHxWG	666998855	2026-06-23 17:41:30.561601+00	2026-06-23 17:41:30.349605+00	\N	\N	\N	\N	840b07f560aab2a3f97f51f9b251b043d23daa837e665f6f2065606dfc26cf5f
\.


ALTER TABLE public.users ENABLE TRIGGER ALL;

--
-- Data for Name: formal_notifications; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.formal_notifications DISABLE TRIGGER ALL;

COPY public.formal_notifications (id, citizen_id, procedure_id, type_key, subject, body, status, available_at, expires_at, accessed_at, resolved_at, expired_at, resolution_notes, issued_by, notify_by_email, created_at, updated_at) FROM stdin;
5b4cfb8f-dbc0-4454-b35b-83dd67dad256	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	d517f01f-cc9b-43a2-906b-c67ef2aa940b	REQUEST_INFO	dfsdfsdf	asdasdasdasd	ACCEPTED	2026-05-28 20:17:53.534331+00	2026-06-07 20:17:53.531769+00	2026-05-28 20:30:47.617327+00	2026-05-28 20:30:47.617331+00	\N		81151e14-514b-4b0e-8afb-d9353a48807a	t	2026-05-28 20:17:53.566181+00	2026-05-28 20:30:47.619363+00
5c96d3a7-48b4-4fcd-ba04-0d6924defcee	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	d517f01f-cc9b-43a2-906b-c67ef2aa940b	RESOLUTION_NOTICE	Cruz del Campo	sdfsdfsdfsdfsdfsdfs	ACCEPTED	2026-05-28 21:38:49.470132+00	2026-06-07 21:38:49.467854+00	2026-05-28 21:39:04.765155+00	2026-05-29 14:49:04.945822+00	\N		81151e14-514b-4b0e-8afb-d9353a48807a	t	2026-05-28 21:38:49.47371+00	2026-05-29 14:49:04.952693+00
\.


ALTER TABLE public.formal_notifications ENABLE TRIGGER ALL;

--
-- Data for Name: formal_notification_attachments; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.formal_notification_attachments DISABLE TRIGGER ALL;

COPY public.formal_notification_attachments (id, notification_id, name, mime_type, size, storage_path, created_at) FROM stdin;
d226efa7-38e3-4fa2-8ef5-670aaabd3373	5c96d3a7-48b4-4fcd-ba04-0d6924defcee	carpeta-ciudadana-2026-05-28.pdf	application/pdf	5778	93b5abaa-1cfc-40ea-85f8-58ea40113200.pdf	2026-05-28 21:38:49.481141+00
\.


ALTER TABLE public.formal_notification_attachments ENABLE TRIGGER ALL;

--
-- Data for Name: message_threads; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.message_threads DISABLE TRIGGER ALL;

COPY public.message_threads (id, created_at, last_message_at, unread_count_admin, unread_count_citizen, updated_at, procedure_id) FROM stdin;
60b3362d-b8cb-4a2a-9d3f-3208b8cc7951	2026-05-20 06:36:15.867668+00	2026-05-20 07:36:50.930041+00	0	0	2026-05-20 07:37:06.591567+00	f5932298-9c65-412a-beac-6cfa0200088b
87f937d1-bf03-44e6-8eb7-543fb0f84240	2026-05-20 14:35:01.914651+00	2026-05-20 14:36:04.6848+00	0	0	2026-05-20 14:36:06.172789+00	3e9429d1-87b1-4772-b866-12a42f10c376
4de18341-a4eb-4189-9176-35512a7ecda1	2026-05-21 21:12:37.29185+00	2026-05-21 21:12:54.981024+00	0	0	2026-05-21 21:13:01.449005+00	3685f359-0e50-4ddc-8000-ffd302e13dd6
\.


ALTER TABLE public.message_threads ENABLE TRIGGER ALL;

--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.messages DISABLE TRIGGER ALL;

COPY public.messages (id, attachment_count, content, created_at, is_read, read_at, sender_email, sender_name, sender_role, template_key, thread_id) FROM stdin;
dcae844d-4732-46bd-a7da-b1d62c35e836	0	sadsda	2026-05-20 06:36:15.885048+00	f	\N	admin@tfm.es	Test Admin	ADMIN	\N	60b3362d-b8cb-4a2a-9d3f-3208b8cc7951
bf978506-8dca-483b-b217-a226a0add468	0	adadasd	2026-05-20 06:36:31.111329+00	f	\N	citizen@tfm.es	Test Citizen	CITIZEN	\N	60b3362d-b8cb-4a2a-9d3f-3208b8cc7951
62ce607a-5c7d-4eb1-899e-6ea7fa62c25d	0	hola	2026-05-20 06:47:52.169356+00	f	\N	citizen@tfm.es	Test Citizen	CITIZEN	\N	60b3362d-b8cb-4a2a-9d3f-3208b8cc7951
3faf5130-32d4-42cd-aa26-0a851af71a56	0	aaaaaaaaa	2026-05-20 07:05:54.27771+00	f	\N	admin@tfm.es	Test Admin	ADMIN	\N	60b3362d-b8cb-4a2a-9d3f-3208b8cc7951
07c4a20d-d8d0-48db-8fc4-80f5dfd8c229	0	werwerwer	2026-05-20 07:30:49.94343+00	f	\N	citizen@tfm.es	Test Citizen	CITIZEN	\N	60b3362d-b8cb-4a2a-9d3f-3208b8cc7951
62ff1b87-1a30-4c83-9bd8-0e697cd87b26	0	aaaaaaaaaaaaaaaaaaaaaaaaaaaaa	2026-05-20 07:33:53.438192+00	f	\N	citizen@tfm.es	Test Citizen	CITIZEN	\N	60b3362d-b8cb-4a2a-9d3f-3208b8cc7951
677998d0-02b3-4947-b22f-5a8490923320	0	sssssssssssssss	2026-05-20 07:36:50.905498+00	f	\N	citizen@tfm.es	Test Citizen	CITIZEN	\N	60b3362d-b8cb-4a2a-9d3f-3208b8cc7951
9d6b7c54-504d-41dc-a0c5-be5a92559c95	0	Prueba	2026-05-20 14:35:01.934128+00	f	\N	citizen@tfm.es	Test Citizen	CITIZEN	\N	87f937d1-bf03-44e6-8eb7-543fb0f84240
11860ada-10c5-4693-9ff2-bb13bfb2b3a7	0	sdfsdfsdfsdf	2026-05-20 14:36:04.684568+00	f	\N	admin@tfm.es	Test Admin	ADMIN	\N	87f937d1-bf03-44e6-8eb7-543fb0f84240
6211926d-5640-461f-a187-012f22535cd8	0	aaaaaaaaaa	2026-05-21 21:12:37.299146+00	f	\N	citizen@tfm.es	Test Citizen	CITIZEN	\N	4de18341-a4eb-4189-9176-35512a7ecda1
468797ff-47bb-442c-b67f-a98255b0f2de	0	asdasdasd	2026-05-21 21:12:54.98068+00	f	\N	admin@tfm.es	Test Admin	ADMIN	\N	4de18341-a4eb-4189-9176-35512a7ecda1
\.


ALTER TABLE public.messages ENABLE TRIGGER ALL;

--
-- Data for Name: message_attachments; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.message_attachments DISABLE TRIGGER ALL;

COPY public.message_attachments (id, created_at, mime_type, name, size, storage_path, message_id) FROM stdin;
\.


ALTER TABLE public.message_attachments ENABLE TRIGGER ALL;

--
-- Data for Name: procedure_record_counters; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.procedure_record_counters DISABLE TRIGGER ALL;

COPY public.procedure_record_counters (unit_code, year, last_value) FROM stdin;
OFICINAD	2026	1
PARQUESY	2026	1
CONTRATA	2026	1
UNIDADDE	2026	5
\.


ALTER TABLE public.procedure_record_counters ENABLE TRIGGER ALL;

--
-- Data for Name: procedure_task_field_i18n; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.procedure_task_field_i18n DISABLE TRIGGER ALL;

COPY public.procedure_task_field_i18n (id, created_at, field_id, locale, name, options_json, placeholder, procedure_type_id, task_order_index, updated_at) FROM stdin;
e47423e3-5aea-4b99-8728-9e583a5b95b3	2026-05-19 20:03:59.888976+00	applicantFullName	es-ES	Nombre completo	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.888976+00
2b428ea9-52df-44b1-a916-739b2e547b4d	2026-05-19 20:03:59.900271+00	applicantFullName	ca-ES	Nom complet	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.900271+00
cee25b12-8284-432d-b6e2-a41dfff18922	2026-05-19 20:03:59.905582+00	applicantFullName	eu-ES	Izen-abizenak	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.905582+00
2b6ab287-0dc7-4b6f-b343-57f266fb9d6c	2026-05-19 20:03:59.911616+00	applicantFullName	gl-ES	Nome completo	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.911616+00
a6bdd76b-707f-42f0-8a39-ac12ff2f07d7	2026-05-19 20:03:59.919035+00	applicantFullName	va-ES	Nom complet	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.919035+00
bc197496-ea2d-4bcc-afc7-5f267c66da05	2026-05-19 20:03:59.924241+00	applicantEmail	es-ES	Correo electronico	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.924241+00
83ede6c6-0521-4c3e-8766-021e4a4b03c8	2026-05-19 20:03:59.930004+00	applicantEmail	ca-ES	Correu electrònic	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.930004+00
a062bd83-d4ce-42c1-9e04-0516675e7dbb	2026-05-19 20:03:59.935034+00	applicantEmail	eu-ES	Posta elektronikoa	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.935034+00
9b256ec3-6799-4240-a76b-c4b547acaee7	2026-05-19 20:03:59.940663+00	applicantEmail	gl-ES	Correu electrònic	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.940663+00
d8c72d9c-c4c3-42b5-abaf-47b6ab81202d	2026-05-19 20:03:59.944799+00	applicantEmail	va-ES	Correu electrònic	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.944799+00
b5e39652-6c37-4bfc-ae2d-ba126892b321	2026-05-19 20:03:59.949381+00	applicationReason	es-ES	Motivo de la solicitud	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.949381+00
2c28ed16-c617-4674-9900-33c2c693e645	2026-05-19 20:03:59.955553+00	applicationReason	ca-ES	Motiu de la sol·licitud	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.955553+00
8dd476ba-5379-49a8-aa7d-cc0c0d1469e8	2026-05-19 20:03:59.959872+00	applicationReason	eu-ES	Eskaeraren arrazoia	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.959872+00
2f1b1659-f57b-40f3-9bd4-78c1edcf2fb7	2026-05-19 20:03:59.963969+00	applicationReason	gl-ES	Motivo de la sol·licitud	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.963969+00
43357e58-9f83-496b-a3ea-900253ec0770	2026-05-19 20:03:59.968404+00	applicationReason	va-ES	Motiu de la sol·licitud	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.968404+00
3c3d0938-43c8-4ba4-9997-5e8bddb50494	2026-05-19 20:03:59.974719+00	businessName	es-ES	Nombre de la actividad	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.974719+00
f6fe30c8-e703-474f-89e2-140ba05643ae	2026-05-19 20:03:59.978987+00	businessName	ca-ES	Nom de l'activitat	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.978987+00
5aacd218-f645-4a67-9d9e-e345ef956286	2026-05-19 20:03:59.982991+00	businessName	eu-ES	Jarduera izena	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.982991+00
0fb4d1cc-3069-4bd7-90d9-862d8644f20c	2026-05-19 20:03:59.987525+00	businessName	gl-ES	Nom de l'activitat	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.987525+00
8947c5a0-c247-47a5-9535-8bbde5ff74bb	2026-05-19 20:03:59.991628+00	businessName	va-ES	Nom de l'activitat	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.991628+00
6b54d59c-29bc-4498-92f2-c200a49ef416	2026-05-19 20:03:59.99548+00	premisesAddress	es-ES	Direccion del local	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.99548+00
5902a0d9-0ece-4146-aef9-a3f43b3951da	2026-05-19 20:03:59.999483+00	premisesAddress	ca-ES	Adreça del local	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:03:59.999483+00
05346dd5-6a4f-438f-9168-8c5f4765bdf8	2026-05-19 20:04:00.00607+00	premisesAddress	eu-ES	Lokalaren helbidea	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:04:00.00607+00
272003c4-2919-48e7-8b96-8ce318bf817c	2026-05-19 20:04:00.010111+00	premisesAddress	gl-ES	Adreça del local	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:04:00.010111+00
2d2b58e3-aa23-4651-977f-642615661eb7	2026-05-19 20:04:00.013803+00	premisesAddress	va-ES	Adreça del local	[]		a98135be-77fc-43f5-a6bf-e85ec5633ba5	0	2026-05-19 20:04:00.013803+00
1760e7a3-1cbc-4902-a2e4-5a3631017347	2026-05-19 20:04:00.071159+00	applicantFullName	es-ES	Nombre completo	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.071159+00
e9b1d1bd-e575-48a6-a335-cde3d18b44f0	2026-05-19 20:04:00.075786+00	applicantFullName	ca-ES	Nom complet	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.075786+00
8ed1c135-8980-47cb-992c-360bd4e17d72	2026-05-19 20:04:00.081844+00	applicantFullName	eu-ES	Izen-abizenak	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.081844+00
f08cf242-764e-4125-b46f-d21036125965	2026-05-19 20:04:00.086427+00	applicantFullName	gl-ES	Nome completo	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.086427+00
d2e0670c-f3f7-41f6-8ec2-57c84bc64454	2026-05-19 20:04:00.090818+00	applicantFullName	va-ES	Nom complet	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.090818+00
eb519b40-c9f3-49a3-adc6-943f48a9f494	2026-05-19 20:04:00.09483+00	applicantEmail	es-ES	Correo electronico	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.09483+00
3bc2722a-4144-4db1-952a-bcf5a592676d	2026-05-19 20:04:00.100217+00	applicantEmail	ca-ES	Correu electrònic	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.100217+00
87630488-cbc0-493a-b498-b5bf6abb2a86	2026-05-19 20:04:00.105677+00	applicantEmail	eu-ES	Posta elektronikoa	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.105677+00
d949def8-2c11-48a1-8764-67c79c16508f	2026-05-19 20:04:00.135018+00	applicantEmail	gl-ES	Correu electrònic	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.135018+00
df5de12c-e595-45ec-9924-0f5d77802fdc	2026-05-19 20:04:00.140596+00	applicantEmail	va-ES	Correu electrònic	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.140596+00
9f0b440f-1a4b-4c59-b0b5-04e8f5c2393e	2026-05-19 20:04:00.145668+00	applicationReason	es-ES	Motivo de la solicitud	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.145668+00
2deddccc-5b0e-47a6-ae6a-dc516602741a	2026-05-19 20:04:00.151337+00	applicationReason	ca-ES	Motiu de la sol·licitud	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.151337+00
af2b1734-ee02-4d4f-8120-8a2b3586a03f	2026-05-19 20:04:00.156998+00	applicationReason	eu-ES	Eskaeraren arrazoia	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.156998+00
29ee4466-3f27-4c16-a3b6-5836d64e5630	2026-05-19 20:04:00.16358+00	applicationReason	gl-ES	Motivo de la sol·licitud	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.16358+00
fba9ae6b-9558-4c6b-a120-ec9f34d83659	2026-05-19 20:04:00.170527+00	applicationReason	va-ES	Motiu de la sol·licitud	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.170527+00
371fb4df-40f0-43f9-8f5e-4a4ad7987e53	2026-05-19 20:04:00.190847+00	certificateType	es-ES	Tipo de certificado	[{"value":"padron","label":"Padron"},{"value":"convivencia","label":"Convivencia"},{"value":"residencia","label":"Residencia"}]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.190847+00
801ce23a-fbb8-4546-9f79-e0715a586d08	2026-05-19 20:04:00.198535+00	certificateType	ca-ES	Tipus de certificat	[{"value":"padron","label":"Padron"},{"value":"convivencia","label":"Convivencia"},{"value":"residencia","label":"Residencia"}]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.198535+00
0db29261-f9ec-4222-9c2a-e6e75bbcef69	2026-05-19 20:04:00.20564+00	certificateType	eu-ES	Ziurtagiri mota	[{"value":"padron","label":"Padron"},{"value":"convivencia","label":"Convivencia"},{"value":"residencia","label":"Residencia"}]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.20564+00
0f89f7b7-7db3-446c-8a64-05ac28828e90	2026-05-19 20:04:00.214019+00	certificateType	gl-ES	Tipus de certificat	[{"value":"padron","label":"Padron"},{"value":"convivencia","label":"Convivencia"},{"value":"residencia","label":"Residencia"}]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.214019+00
dad68914-9c34-407e-86ba-e4fa331f65ef	2026-05-19 20:04:00.2209+00	certificateType	va-ES	Tipus de certificat	[{"value":"padron","label":"Padron"},{"value":"convivencia","label":"Convivencia"},{"value":"residencia","label":"Residencia"}]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.2209+00
4a83bd80-cc53-4ea0-b8e2-3cbf7e3f8b42	2026-05-19 20:04:00.233637+00	certificatePurpose	es-ES	Finalidad	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.233637+00
2cefd69f-f7e7-4493-8de9-33c420dc1955	2026-05-19 20:04:00.240401+00	certificatePurpose	ca-ES	Finalitat	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.240401+00
86b7a653-ed1c-4742-9375-d60fb61d97c3	2026-05-19 20:04:00.246662+00	certificatePurpose	eu-ES	Helburua	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.246662+00
da03d6af-36fc-4aa5-a764-799ad4e12913	2026-05-19 20:04:00.25193+00	certificatePurpose	gl-ES	Finalitat	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.25193+00
e4a70eca-32ff-4ff4-b594-35117254fce3	2026-05-19 20:04:00.259124+00	certificatePurpose	va-ES	Finalitat	[]		ebeba1d1-ec1b-4a75-a494-f2d485243e65	0	2026-05-19 20:04:00.259124+00
da03f552-d57b-4c99-923b-37d61cabd608	2026-05-19 20:04:00.322813+00	applicantFullName	es-ES	Nombre completo	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.322813+00
e98678d1-2374-4d49-ada8-7a12530ebe6a	2026-05-19 20:04:00.326808+00	applicantFullName	ca-ES	Nom complet	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.326808+00
45ba9f3b-75fd-4576-a903-6ad8bbcf4e4a	2026-05-19 20:04:00.330716+00	applicantFullName	eu-ES	Izen-abizenak	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.330716+00
277d58db-5d3d-4cbf-a942-0126ffa812cf	2026-05-19 20:04:00.336496+00	applicantFullName	gl-ES	Nome completo	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.336496+00
382fbd34-31f4-483e-b72e-69c843fd2b4d	2026-05-19 20:04:00.340325+00	applicantFullName	va-ES	Nom complet	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.340325+00
daf2c676-0f97-45a2-9b9e-6d85bef54c05	2026-05-19 20:04:00.344306+00	applicantEmail	es-ES	Correo electronico	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.344306+00
ea08c2a6-e745-48ff-b72c-915324a7ce35	2026-05-19 20:04:00.348347+00	applicantEmail	ca-ES	Correu electrònic	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.348347+00
3ec03a0d-a37b-4a9b-b696-d505a41e7cd4	2026-05-19 20:04:00.354542+00	applicantEmail	eu-ES	Posta elektronikoa	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.354542+00
f1b06c53-f6fe-4c80-bc9c-9a34137b3e78	2026-05-19 20:04:00.359396+00	applicantEmail	gl-ES	Correu electrònic	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.359396+00
8bdb9899-cdea-4f76-a566-7ed3790998dc	2026-05-19 20:04:00.364217+00	applicantEmail	va-ES	Correu electrònic	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.364217+00
89d0d148-1e2b-479a-88e5-9742f6bc0d90	2026-05-19 20:04:00.368769+00	applicationReason	es-ES	Motivo de la solicitud	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.368769+00
ffb2309b-eb04-4994-a8ef-800446c38e28	2026-05-19 20:04:00.374318+00	applicationReason	ca-ES	Motiu de la sol·licitud	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.374318+00
6abe73d4-ddc3-41ab-b89a-50f9f4688ad5	2026-05-19 20:04:00.37846+00	applicationReason	eu-ES	Eskaeraren arrazoia	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.37846+00
26e1316a-84fd-4038-8de3-9f365d2666a1	2026-05-19 20:04:00.382414+00	applicationReason	gl-ES	Motivo de la sol·licitud	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.382414+00
e57bd834-a214-4332-9491-2c2020e2de3a	2026-05-19 20:04:00.386131+00	applicationReason	va-ES	Motiu de la sol·licitud	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.386131+00
24e94bee-fbb8-4cf1-a714-f2fa9b053c92	2026-05-19 20:04:00.390694+00	currentAddress	es-ES	Direccion actual	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.390694+00
2f51f393-cc81-4d67-9a68-793cf8ad6df0	2026-05-19 20:04:00.39513+00	currentAddress	ca-ES	Adreça actual	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.39513+00
942b6bc3-715f-4ead-aaab-8a6add4d50cf	2026-05-19 20:04:00.398775+00	currentAddress	eu-ES	Uneko helbidea	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.398775+00
47cabb1c-a9fc-471e-aa36-0e3e5e4736cc	2026-05-19 20:04:00.40262+00	currentAddress	gl-ES	Adreça actual	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.40262+00
5396891b-ceee-4282-8209-e57198bf697b	2026-05-19 20:04:00.406159+00	currentAddress	va-ES	Adreça actual	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.406159+00
1f201611-2199-47b2-8472-9d85ae096f56	2026-05-19 20:04:00.411845+00	newAddress	es-ES	Nueva direccion	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.411845+00
6126f704-fc4f-45bb-82c7-a85079ee0f70	2026-05-19 20:04:00.416781+00	newAddress	ca-ES	Nova adreça	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.416781+00
fc31ff8f-3f7c-4e57-b22e-81b9897c91d3	2026-05-19 20:04:00.421609+00	newAddress	eu-ES	Helbide berria	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.421609+00
a94ffbc9-454e-472a-8590-16cf6351730c	2026-05-19 20:04:00.426046+00	newAddress	gl-ES	Nova adreça	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.426046+00
b23342c0-a821-4f07-be03-36e95183ad62	2026-05-19 20:04:00.4319+00	newAddress	va-ES	Nova adreça	[]		7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	0	2026-05-19 20:04:00.4319+00
734e9411-e010-41e2-a6ff-371ce62b80ab	2026-05-19 20:04:00.477572+00	applicantFullName	es-ES	Nombre completo	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.477572+00
c51f2da0-502d-4f74-93e6-900d2f11527e	2026-05-19 20:04:00.48173+00	applicantFullName	ca-ES	Nom complet	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.48173+00
254cfa02-b5d4-4138-a901-9fdc4a34a16e	2026-05-19 20:04:00.486214+00	applicantFullName	eu-ES	Izen-abizenak	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.486214+00
8a0d317d-8686-46fb-98c2-9c8fbe336ae7	2026-05-19 20:04:00.490902+00	applicantFullName	gl-ES	Nome completo	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.490902+00
096b3502-4b6d-4dee-a8ad-f7eec5efd88b	2026-05-19 20:04:00.494695+00	applicantFullName	va-ES	Nom complet	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.494695+00
39c74cf1-c8e0-442d-8b69-22b9fdb0aa24	2026-05-19 20:04:00.4989+00	applicantEmail	es-ES	Correo electronico	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.4989+00
269b912e-6ec8-4d93-8651-808a5273db1d	2026-05-19 20:04:00.503061+00	applicantEmail	ca-ES	Correu electrònic	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.503061+00
9c2de6ae-6acc-4b98-a2db-4372728d3b37	2026-05-19 20:04:00.508257+00	applicantEmail	eu-ES	Posta elektronikoa	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.508257+00
fc1432d8-f2c8-4298-8081-d15041ce1957	2026-05-19 20:04:00.512264+00	applicantEmail	gl-ES	Correu electrònic	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.512264+00
c1768363-0367-479a-8c4a-3a6d1a68c376	2026-05-19 20:04:00.51643+00	applicantEmail	va-ES	Correu electrònic	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.51643+00
e37ab510-3744-48be-953d-872b1b432c8b	2026-05-19 20:04:00.520811+00	applicationReason	es-ES	Motivo de la solicitud	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.520811+00
c3862f33-ff7b-4347-a42f-0669069a7cb2	2026-05-19 20:04:00.525703+00	applicationReason	ca-ES	Motiu de la sol·licitud	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.525703+00
8ec6a8bc-8ce2-4a2e-9b63-65e6680b5614	2026-05-19 20:04:00.53037+00	applicationReason	eu-ES	Eskaeraren arrazoia	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.53037+00
549aac73-1c1b-4cd6-a820-1a0ee2258ec6	2026-05-19 20:04:00.535268+00	applicationReason	gl-ES	Motivo de la sol·licitud	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.535268+00
088f961f-344c-47a1-8be0-0f537d2d405a	2026-05-19 20:04:00.539512+00	applicationReason	va-ES	Motiu de la sol·licitud	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.539512+00
c9b5442a-9162-439d-a603-7b5759ccf817	2026-05-19 20:04:00.544505+00	workType	es-ES	Tipo de obra	[{"value":"minor","label":"Menor"},{"value":"major","label":"Mayor"},{"value":"renovation","label":"Reforma"}]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.544505+00
0e2b96a8-07bb-4a0e-94cf-884efcfb13aa	2026-05-19 20:04:00.54927+00	workType	ca-ES	Tipus d'obra	[{"value":"minor","label":"Menor"},{"value":"major","label":"Mayor"},{"value":"renovation","label":"Reforma"}]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.54927+00
5ce2a288-09c3-4220-b558-49882093e704	2026-05-19 20:04:00.553808+00	workType	eu-ES	Obra mota	[{"value":"minor","label":"Menor"},{"value":"major","label":"Mayor"},{"value":"renovation","label":"Reforma"}]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.553808+00
5651fdbe-3c3b-4440-ac75-c83c765c3857	2026-05-19 20:04:00.557526+00	workType	gl-ES	Tipus d'obra	[{"value":"minor","label":"Menor"},{"value":"major","label":"Mayor"},{"value":"renovation","label":"Reforma"}]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.557526+00
35c51cb4-95b0-4dcb-b0e7-c784e98bbdab	2026-05-19 20:04:00.561267+00	workType	va-ES	Tipus d'obra	[{"value":"minor","label":"Menor"},{"value":"major","label":"Mayor"},{"value":"renovation","label":"Reforma"}]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.561267+00
adce52a7-54b3-4467-8092-1c560ca6e9db	2026-05-19 20:04:00.565156+00	plotReference	es-ES	Referencia catastral	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.565156+00
fc71b68b-9ba4-45dd-86c6-32e722837984	2026-05-19 20:04:00.570015+00	plotReference	ca-ES	Referència cadastral	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.570015+00
1996271d-15fe-4aec-9f15-87134ffd8679	2026-05-19 20:04:00.573335+00	plotReference	eu-ES	Erreferentzia katastrala	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.573335+00
04b33300-a1c8-4911-8685-0f937acb91f2	2026-05-19 20:04:00.576762+00	plotReference	gl-ES	Referència cadastral	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.576762+00
60cfe3eb-0faa-4d2d-b4bb-322370e7ed66	2026-05-19 20:04:00.580152+00	plotReference	va-ES	Referència cadastral	[]		58047cd7-a841-420b-b717-94e17d9d017a	0	2026-05-19 20:04:00.580152+00
98957828-2a5a-415f-9485-e83441c27129	2026-05-19 20:04:00.619787+00	applicantFullName	es-ES	Nombre completo	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.619787+00
c04bc92d-29bf-4c9f-ae9b-afdde2d04890	2026-05-19 20:04:00.624116+00	applicantFullName	ca-ES	Nom complet	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.624116+00
f7e73ec6-d79b-49ea-a687-cbad6eb8c6f3	2026-05-19 20:04:00.627796+00	applicantFullName	eu-ES	Izen-abizenak	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.627796+00
b39f81a7-98e6-4b98-b4b9-d65a18ddbbaf	2026-05-19 20:04:00.63111+00	applicantFullName	gl-ES	Nome completo	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.63111+00
8dee36f3-ea68-464f-ac70-34058a41ebcb	2026-05-19 20:04:00.634428+00	applicantFullName	va-ES	Nom complet	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.634428+00
bce50ecb-9e4b-46d1-a6bc-d974a55a4e55	2026-05-19 20:04:00.638228+00	applicantEmail	es-ES	Correo electronico	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.638228+00
58248b67-9bf6-4d7c-840a-6b16935eb664	2026-05-19 20:04:00.643023+00	applicantEmail	ca-ES	Correu electrònic	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.643023+00
aa89d45a-13ad-48d2-90f6-12c7c3197973	2026-05-19 20:04:00.646193+00	applicantEmail	eu-ES	Posta elektronikoa	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.646193+00
26a3f2a7-4e84-4510-a4dc-e6f5e45958c9	2026-05-19 20:04:00.649212+00	applicantEmail	gl-ES	Correu electrònic	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.649212+00
2a8f0a28-55ed-46d4-a880-0f701d52ad15	2026-05-19 20:04:00.652289+00	applicantEmail	va-ES	Correu electrònic	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.652289+00
33fac5c1-594a-4526-a095-e8c77a924778	2026-05-19 20:04:00.655525+00	applicationReason	es-ES	Motivo de la solicitud	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.655525+00
5ecf1305-b143-4ed2-b1cb-d3ed20daa53a	2026-05-19 20:04:00.659033+00	applicationReason	ca-ES	Motiu de la sol·licitud	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.659033+00
65ec67ec-7823-4ca3-96e3-c01a8b77dbef	2026-05-19 20:04:00.663345+00	applicationReason	eu-ES	Eskaeraren arrazoia	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.663345+00
2e835754-223a-4810-994c-319141b81b5d	2026-05-19 20:04:00.66684+00	applicationReason	gl-ES	Motivo de la sol·licitud	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.66684+00
e6132de6-b364-4548-b8fb-ac63cc2e52ed	2026-05-19 20:04:00.670066+00	applicationReason	va-ES	Motiu de la sol·licitud	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.670066+00
979b3809-411c-4cbf-a6a5-060f3ace8475	2026-05-19 20:04:00.673538+00	incidentAddress	es-ES	Ubicacion del ruido	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.673538+00
9065854e-7a57-42a2-91ac-0d4479d63c60	2026-05-19 20:04:00.67742+00	incidentAddress	ca-ES	Ubicació del soroll	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.67742+00
e290abe9-ab8d-4147-8f26-bf228ed037d0	2026-05-19 20:04:00.680576+00	incidentAddress	eu-ES	Zarata kokapena	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.680576+00
49862d60-27c4-4922-8123-6ea65acc7996	2026-05-19 20:04:00.683359+00	incidentAddress	gl-ES	Ubicació del soroll	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.683359+00
c0f096ba-5b5e-410f-b17b-694962d126d0	2026-05-19 20:04:00.6863+00	incidentAddress	va-ES	Ubicació del soroll	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.6863+00
3213838a-db19-4049-acc6-54e5f01ecaa9	2026-05-19 20:04:00.689968+00	incidentSchedule	es-ES	Horario habitual	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.689968+00
a1b048ac-b707-4bfd-ae18-f5acd9a0890f	2026-05-19 20:04:00.694332+00	incidentSchedule	ca-ES	Horari habitual	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.694332+00
19f264d2-411d-46a2-bb24-839703fd60b5	2026-05-19 20:04:00.697808+00	incidentSchedule	eu-ES	Ohiko ordutegia	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.697808+00
5075ff31-f54a-451c-be13-774d99532fd9	2026-05-19 20:04:00.701057+00	incidentSchedule	gl-ES	Horari habitual	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.701057+00
bc2597de-bac5-47c4-af6c-afee495c01cd	2026-05-19 20:04:00.704629+00	incidentSchedule	va-ES	Horari habitual	[]		a0979ce0-21e1-4625-8da4-5cb8ab05c690	0	2026-05-19 20:04:00.704629+00
e0ee6f7e-828e-42de-88e5-78771d4ba7ab	2026-05-19 20:04:00.743356+00	applicantFullName	es-ES	Nombre completo	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.743356+00
20ca2e56-8170-41a2-965a-f23088a32822	2026-05-19 20:04:00.746363+00	applicantFullName	ca-ES	Nom complet	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.746363+00
ab6fa0a3-a953-412c-af9a-bfb262e68402	2026-05-19 20:04:00.750643+00	applicantFullName	eu-ES	Izen-abizenak	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.750643+00
8c397171-272f-44dc-bc4b-17811d51e82d	2026-05-19 20:04:00.755218+00	applicantFullName	gl-ES	Nome completo	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.755218+00
e572dd8e-0a39-40be-925d-9da889e85f61	2026-05-19 20:04:00.758631+00	applicantFullName	va-ES	Nom complet	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.758631+00
54d802f4-39a7-418d-aad7-46297dac8726	2026-05-19 20:04:00.761837+00	applicantEmail	es-ES	Correo electronico	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.761837+00
d7e67d53-9a21-46c2-a08f-9a23f00cb4be	2026-05-19 20:04:00.76582+00	applicantEmail	ca-ES	Correu electrònic	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.76582+00
4f4631ff-bd0e-4df7-a2e7-5ab8981d5909	2026-05-19 20:04:00.769673+00	applicantEmail	eu-ES	Posta elektronikoa	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.769673+00
c801fa67-1420-4b7e-a7cd-c5a8d663f970	2026-05-19 20:04:00.773973+00	applicantEmail	gl-ES	Correu electrònic	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.773973+00
d3d71d54-038b-4131-a0b6-186064836846	2026-05-19 20:04:00.77724+00	applicantEmail	va-ES	Correu electrònic	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.77724+00
30571d9f-22b7-4bcb-bb12-3ed7f7528865	2026-05-19 20:04:00.780682+00	applicationReason	es-ES	Motivo de la solicitud	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.780682+00
c0359afa-cc3a-45b7-b75c-be660cb4f5b6	2026-05-19 20:04:00.784145+00	applicationReason	ca-ES	Motiu de la sol·licitud	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.784145+00
0e7ad267-92fa-4c53-9e5b-f7db0a82809e	2026-05-19 20:04:00.787576+00	applicationReason	eu-ES	Eskaeraren arrazoia	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.787576+00
72fcbbd6-de68-4796-911e-a80bdfb6cd03	2026-05-19 20:04:00.792194+00	applicationReason	gl-ES	Motivo de la sol·licitud	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.792194+00
0e317a7e-a32d-4fe3-860c-1fd80007ce4d	2026-05-19 20:04:00.795521+00	applicationReason	va-ES	Motiu de la sol·licitud	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.795521+00
c959a5f8-76aa-41e5-ada7-3b4b8a27a0d1	2026-05-19 20:04:00.798625+00	occupancyPurpose	es-ES	Motivo de ocupacion	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.798625+00
f02d98bb-4cc4-4469-b1b5-17dc7d4e406a	2026-05-19 20:04:00.801629+00	occupancyPurpose	ca-ES	Motiu d'ocupació	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.801629+00
fe791b69-fb93-4ef3-9721-2b4c4a93257c	2026-05-19 20:04:00.805211+00	occupancyPurpose	eu-ES	Okupazio arrazoia	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.805211+00
3245d417-f95e-4f42-9528-c2021e927b56	2026-05-19 20:04:00.809648+00	occupancyPurpose	gl-ES	Motiu d'ocupació	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.809648+00
814b738d-9fbd-4ca3-a993-76a071097d0b	2026-05-19 20:04:00.812793+00	occupancyPurpose	va-ES	Motiu d'ocupació	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.812793+00
aeebcbbf-0dec-4363-924d-4570f8b76b01	2026-05-19 20:04:00.815994+00	occupancyDates	es-ES	Fechas previstas	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.815994+00
274b848e-cc0c-41e2-9449-0f47664e890b	2026-05-19 20:04:00.819667+00	occupancyDates	ca-ES	Dates previstes	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.819667+00
eed262b4-2af7-4bb7-8ee2-b4ade4af9af6	2026-05-19 20:04:00.822829+00	occupancyDates	eu-ES	Aurreikusitako datak	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.822829+00
7e2a5919-5520-4808-a0cd-464a9e1817b1	2026-05-19 20:04:00.827157+00	occupancyDates	gl-ES	Dates previstes	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.827157+00
03e3053d-8293-4d50-90ce-f14381786a09	2026-05-19 20:04:00.830705+00	occupancyDates	va-ES	Dates previstes	[]		c67a82e3-fbae-465a-8237-569db71336f9	0	2026-05-19 20:04:00.830705+00
53b7342b-38a8-419b-be40-6fed5d6bf797	2026-05-19 20:04:00.87066+00	applicantFullName	es-ES	Nombre completo	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.87066+00
183c7245-16c9-4ff3-9989-eadb0fd71528	2026-05-19 20:04:00.874657+00	applicantFullName	ca-ES	Nom complet	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.874657+00
7af9029f-3b9b-49f8-9c78-7549fee44e78	2026-05-19 20:04:00.878543+00	applicantFullName	eu-ES	Izen-abizenak	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.878543+00
f957bbd7-17f0-4451-b278-c7469d00b39f	2026-05-19 20:04:00.883375+00	applicantFullName	gl-ES	Nome completo	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.883375+00
f9dbac5f-3693-417c-9c39-38c8e0dcd8e8	2026-05-19 20:04:00.886635+00	applicantFullName	va-ES	Nom complet	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.886635+00
c0308571-c2f1-433c-b34c-b0610891228d	2026-05-19 20:04:00.89034+00	applicantEmail	es-ES	Correo electronico	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.89034+00
b5fc58e0-e551-4a1e-bbe5-7538278eb5fa	2026-05-19 20:04:00.8935+00	applicantEmail	ca-ES	Correu electrònic	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.8935+00
7376f2d9-c23c-4566-a14c-d94c97ab2d38	2026-05-19 20:04:00.896503+00	applicantEmail	eu-ES	Posta elektronikoa	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.896503+00
e7abd1c4-8c69-4c90-bfdc-25e8cb8c9c00	2026-05-19 20:04:00.900741+00	applicantEmail	gl-ES	Correu electrònic	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.900741+00
a9b6ab0c-a3f2-49c0-9bfd-56d0162eaae7	2026-05-19 20:04:00.904207+00	applicantEmail	va-ES	Correu electrònic	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.904207+00
1cafb3b6-cc73-424f-b67a-a11883c5b4dc	2026-05-19 20:04:00.907824+00	applicationReason	es-ES	Motivo de la solicitud	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.907824+00
3c69d992-1ee1-4091-a2c6-f610ef41e92f	2026-05-19 20:04:00.91128+00	applicationReason	ca-ES	Motiu de la sol·licitud	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.91128+00
980216ad-f5a6-48e2-a3f3-c4101be23c03	2026-05-19 20:04:00.914241+00	applicationReason	eu-ES	Eskaeraren arrazoia	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.914241+00
4d9866a7-368e-44fd-9319-d337c914930d	2026-05-19 20:04:00.918015+00	applicationReason	gl-ES	Motivo de la sol·licitud	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.918015+00
45d42a59-df1b-477a-883b-b29b747694f8	2026-05-19 20:04:00.921733+00	applicationReason	va-ES	Motiu de la sol·licitud	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.921733+00
c556255c-9761-482f-8931-778d4efff09c	2026-05-19 20:04:00.925289+00	economicActivityCode	es-ES	Epigrafe de actividad	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.925289+00
f632e0d7-9da9-4780-8421-9b2844aa5827	2026-05-19 20:04:00.928357+00	economicActivityCode	ca-ES	Epígraf d'activitat	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.928357+00
3ad4dc9d-6a74-480a-8635-4448296f2f5e	2026-05-19 20:04:00.930892+00	economicActivityCode	eu-ES	Jarduera epigrafea	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.930892+00
31c8cfef-d03e-458f-b24a-76262ea82d5f	2026-05-19 20:04:00.933664+00	economicActivityCode	gl-ES	Epígraf d'activitat	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.933664+00
c943eced-14a4-4732-a472-4170506b492c	2026-05-19 20:04:00.936652+00	economicActivityCode	va-ES	Epígraf d'activitat	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.936652+00
7c127028-6bb9-4a6d-922f-564155064aae	2026-05-19 20:04:00.940015+00	openingDate	es-ES	Fecha prevista de apertura	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.940015+00
81939908-a18e-4a4b-84e4-c4b565bcb412	2026-05-19 20:04:00.945273+00	openingDate	ca-ES	Data prevista d'obertura	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.945273+00
3ab6eeba-17bc-475a-84f1-fcd5c915b880	2026-05-19 20:04:00.948574+00	openingDate	eu-ES	Irekiera data aurreikusita	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.948574+00
6a7772be-fb44-4c9a-abf6-464ce99e6523	2026-05-19 20:04:00.951885+00	openingDate	gl-ES	Data prevista d'obertura	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.951885+00
4241c053-c8e9-4110-b563-b47880fab414	2026-05-19 20:04:00.955736+00	openingDate	va-ES	Data prevista d'obertura	[]		5727b53e-163d-4722-b8cc-f6deafb63a5d	0	2026-05-19 20:04:00.955736+00
719104fa-a386-410a-9747-6b4ff3dfc041	2026-05-19 20:04:00.994016+00	applicantFullName	es-ES	Nombre completo	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:00.994016+00
5bee9d8e-2426-425d-95d9-2fe561f0c631	2026-05-19 20:04:00.997588+00	applicantFullName	ca-ES	Nom complet	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:00.997588+00
f7f29020-8886-456c-a8ed-0080fc0012df	2026-05-19 20:04:01.001621+00	applicantFullName	eu-ES	Izen-abizenak	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.001621+00
2c2a4baf-f0ef-4c33-aeda-b931c7ec3aea	2026-05-19 20:04:01.005334+00	applicantFullName	gl-ES	Nome completo	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.005334+00
a9686f43-0320-43a8-a1fd-51306bad3aab	2026-05-19 20:04:01.008688+00	applicantFullName	va-ES	Nom complet	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.008688+00
1c616eb2-9c57-49db-a100-d43a0b5eb5ef	2026-05-19 20:04:01.013018+00	applicantEmail	es-ES	Correo electronico	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.013018+00
ff77a7e9-6fa0-4654-bfc1-d35a5f8536c1	2026-05-19 20:04:01.018246+00	applicantEmail	ca-ES	Correu electrònic	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.018246+00
0de3d1a2-9c8b-4092-ac08-60cabda938f1	2026-05-19 20:04:01.023598+00	applicantEmail	eu-ES	Posta elektronikoa	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.023598+00
72f085b6-74e5-4841-a0e7-1beb4ca8b747	2026-05-19 20:04:01.027461+00	applicantEmail	gl-ES	Correu electrònic	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.027461+00
3d395bae-a217-4716-bfa7-b8ed3f7f1e6a	2026-05-19 20:04:01.03121+00	applicantEmail	va-ES	Correu electrònic	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.03121+00
b3e42aa1-28b9-4026-98d2-8ed527e56191	2026-05-19 20:04:01.035309+00	applicationReason	es-ES	Motivo de la solicitud	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.035309+00
5baa0608-0d6a-4313-9fab-26ef7c3ff722	2026-05-19 20:04:01.039945+00	applicationReason	ca-ES	Motiu de la sol·licitud	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.039945+00
d760b3d4-419c-4454-9c43-2d9873f343b2	2026-05-19 20:04:01.042962+00	applicationReason	eu-ES	Eskaeraren arrazoia	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.042962+00
9517b513-0257-4464-926b-0938e8d93e70	2026-05-19 20:04:01.045969+00	applicationReason	gl-ES	Motivo de la sol·licitud	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.045969+00
dfef859f-3963-4e03-996c-48ddff4ba2b6	2026-05-19 20:04:01.049028+00	applicationReason	va-ES	Motiu de la sol·licitud	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.049028+00
b657c33d-11fc-4079-a225-f3fe2ab6b9a6	2026-05-19 20:04:01.052109+00	taxReference	es-ES	Referencia tributaria	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.052109+00
68491e76-561a-4d1a-b523-345e7f84cf86	2026-05-19 20:04:01.056336+00	taxReference	ca-ES	Referència tributària	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.056336+00
d51489a0-1d7c-46ad-a06d-415a430ec884	2026-05-19 20:04:01.060046+00	taxReference	eu-ES	Zerga erreferentzia	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.060046+00
9abe5f79-0ea3-409b-8747-feea1ca6ecc6	2026-05-19 20:04:01.063052+00	taxReference	gl-ES	Referència tributària	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.063052+00
859d8048-ca8a-417b-9fc7-e73330260f72	2026-05-19 20:04:01.066033+00	taxReference	va-ES	Referència tributària	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.066033+00
e7b32e9b-8c65-4086-907d-b8858f9f9308	2026-05-19 20:04:01.069035+00	rebateReason	es-ES	Causa de la bonificacion	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.069035+00
3af25cde-1cdd-4ba7-a5e9-c456c798224f	2026-05-19 20:04:01.072967+00	rebateReason	ca-ES	Causa de la bonificació	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.072967+00
e66b4ff9-3496-45f2-96a6-5475f375d0c4	2026-05-19 20:04:01.077218+00	rebateReason	eu-ES	Hobari arrazoia	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.077218+00
5d8ff905-4e67-4df0-9751-b16acb3facf4	2026-05-19 20:04:01.080237+00	rebateReason	gl-ES	Causa de la bonificació	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.080237+00
ce8376a7-901f-40ff-9ca8-e829b1c89b56	2026-05-19 20:04:01.083162+00	rebateReason	va-ES	Causa de la bonificació	[]		0b32b806-8d18-4aa9-baaa-b441e361a177	0	2026-05-19 20:04:01.083162+00
9d9e8b6a-7d36-427c-b675-6385de632764	2026-05-19 20:04:01.119094+00	applicantFullName	es-ES	Nombre completo	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.119094+00
47bb083f-a77e-4f6a-a1a4-818bf9f43cbf	2026-05-19 20:04:01.122432+00	applicantFullName	ca-ES	Nom complet	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.122432+00
677bbfa2-df1a-49c5-a018-b79dfa9815f5	2026-05-19 20:04:01.125331+00	applicantFullName	eu-ES	Izen-abizenak	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.125331+00
52b13a7a-9aa6-48d8-b2a1-8bd025c7ff31	2026-05-19 20:04:01.129088+00	applicantFullName	gl-ES	Nome completo	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.129088+00
44fc8018-4b13-466f-b1c2-06caa79540d7	2026-05-19 20:04:01.132096+00	applicantFullName	va-ES	Nom complet	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.132096+00
445e01ab-0627-4e45-b006-fb85ec27d135	2026-05-19 20:04:01.135066+00	applicantEmail	es-ES	Correo electronico	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.135066+00
5525d1bb-3d8c-4511-9fa7-2be352f91336	2026-05-19 20:04:01.138193+00	applicantEmail	ca-ES	Correu electrònic	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.138193+00
c2ce148f-0f79-423a-a262-692a4f2b6310	2026-05-19 20:04:01.141191+00	applicantEmail	eu-ES	Posta elektronikoa	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.141191+00
a4842ab7-e643-4841-9a41-fb4758ab472f	2026-05-19 20:04:01.144166+00	applicantEmail	gl-ES	Correu electrònic	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.144166+00
36b83eb3-ec83-4532-98dc-8a00b83d54f4	2026-05-19 20:04:01.148273+00	applicantEmail	va-ES	Correu electrònic	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.148273+00
f9242da1-f195-4cb7-850f-506abceb7b88	2026-05-19 20:04:01.15135+00	applicationReason	es-ES	Motivo de la solicitud	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.15135+00
0143bd6e-22b3-41f4-8fd4-78dd4e085651	2026-05-19 20:04:01.154495+00	applicationReason	ca-ES	Motiu de la sol·licitud	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.154495+00
ea464e4d-cbda-4656-87b1-ce692abbd315	2026-05-19 20:04:01.157897+00	applicationReason	eu-ES	Eskaeraren arrazoia	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.157897+00
bdbe659b-bd91-4a42-ab3d-2143ade9f690	2026-05-19 20:04:01.16146+00	applicationReason	gl-ES	Motivo de la sol·licitud	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.16146+00
6241112d-b708-4870-8b62-7cbd441d77ff	2026-05-19 20:04:01.165727+00	applicationReason	va-ES	Motiu de la sol·licitud	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.165727+00
9037c014-188a-4fcd-8f53-0cabb351a793	2026-05-19 20:04:01.169012+00	householdMemberName	es-ES	Nombre del nuevo miembro	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.169012+00
7074042a-7b68-43ac-bd78-3c589cf9cef9	2026-05-19 20:04:01.172205+00	householdMemberName	ca-ES	Nom del nou membre	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.172205+00
d7aabf2a-84f3-42d2-aed5-b7d8b0e1fe9b	2026-05-19 20:04:01.174914+00	householdMemberName	eu-ES	Kide berriaren izena	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.174914+00
cb9f6330-c81c-4e01-b849-633fec2bada0	2026-05-19 20:04:01.17763+00	householdMemberName	gl-ES	Nom del nou membre	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.17763+00
17434b71-25ad-4cc2-a5a5-0a6de81584fa	2026-05-19 20:04:01.180352+00	householdMemberName	va-ES	Nom del nou membre	[]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.180352+00
11fec6d8-12d0-4a90-bbe3-76e14e4d32f3	2026-05-19 20:04:01.184004+00	relationshipType	es-ES	Relacion con titular	[{"value":"spouse","label":"Conyuge"},{"value":"child","label":"Hijo/a"},{"value":"ward","label":"Tutorado/a"},{"value":"other","label":"Otro"}]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.184004+00
002c0847-00dc-4ac2-b603-e5945f753b16	2026-05-19 20:04:01.186974+00	relationshipType	ca-ES	Relació amb el titular	[{"value":"spouse","label":"Conyuge"},{"value":"child","label":"Hijo/a"},{"value":"ward","label":"Tutorado/a"},{"value":"other","label":"Otro"}]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.186974+00
b388c449-6b1e-4f54-80c4-d6a927dc73f3	2026-05-19 20:04:01.189907+00	relationshipType	eu-ES	Titularrekin harremana	[{"value":"spouse","label":"Conyuge"},{"value":"child","label":"Hijo/a"},{"value":"ward","label":"Tutorado/a"},{"value":"other","label":"Otro"}]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.189907+00
9f49d845-ef5e-4750-8ce7-6c65db934172	2026-05-19 20:04:01.192888+00	relationshipType	gl-ES	Relació amb el titular	[{"value":"spouse","label":"Conyuge"},{"value":"child","label":"Hijo/a"},{"value":"ward","label":"Tutorado/a"},{"value":"other","label":"Otro"}]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.192888+00
74ab0161-a243-487d-8eb0-e3faebfde99e	2026-05-19 20:04:01.195991+00	relationshipType	va-ES	Relació amb el titular	[{"value":"spouse","label":"Conyuge"},{"value":"child","label":"Hijo/a"},{"value":"ward","label":"Tutorado/a"},{"value":"other","label":"Otro"}]		0b7d866d-bcb0-4691-86b9-1d96f8325875	0	2026-05-19 20:04:01.195991+00
71dc0f0c-91d1-428f-96f3-387d6adf7cfb	2026-05-19 20:04:01.227319+00	applicantFullName	es-ES	Nombre completo	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.227319+00
987006af-b6f4-4c05-8948-7966442a4db4	2026-05-19 20:04:01.231319+00	applicantFullName	ca-ES	Nom complet	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.231319+00
8a60de9b-d9ad-45f6-a842-de0a81ef2244	2026-05-19 20:04:01.234231+00	applicantFullName	eu-ES	Izen-abizenak	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.234231+00
d08666c8-7f25-4c18-80cd-d3b9971ddaca	2026-05-19 20:04:01.237357+00	applicantFullName	gl-ES	Nome completo	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.237357+00
8e0cecc7-4667-452b-80b9-ee4b771829ae	2026-05-19 20:04:01.240169+00	applicantFullName	va-ES	Nom complet	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.240169+00
c46cb6a7-6917-45ef-bce5-5af8251b965b	2026-05-19 20:04:01.243177+00	applicantEmail	es-ES	Correo electronico	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.243177+00
bbc265da-64d9-4401-a1ac-a92a02961270	2026-05-19 20:04:01.247013+00	applicantEmail	ca-ES	Correu electrònic	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.247013+00
9b239aac-206d-4823-ad48-4a0ec223f64d	2026-05-19 20:04:01.249819+00	applicantEmail	eu-ES	Posta elektronikoa	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.249819+00
cca49120-ff08-4040-86b0-0c1d3834edfc	2026-05-19 20:04:01.252313+00	applicantEmail	gl-ES	Correu electrònic	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.252313+00
5ed4ab46-12be-4198-a693-ac592836ff48	2026-05-19 20:04:01.25513+00	applicantEmail	va-ES	Correu electrònic	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.25513+00
5c55e358-9922-48c4-ac9c-122f86285890	2026-05-19 20:04:01.25802+00	applicationReason	es-ES	Motivo de la solicitud	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.25802+00
0af9f839-a557-47c7-b22a-5d7e7b78745e	2026-05-19 20:04:01.261011+00	applicationReason	ca-ES	Motiu de la sol·licitud	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.261011+00
68445ed3-493f-4a5f-8b2b-7ba829a22805	2026-05-19 20:04:01.264642+00	applicationReason	eu-ES	Eskaeraren arrazoia	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.264642+00
a06bee66-81c7-4020-87bb-862c19e7facd	2026-05-19 20:04:01.267118+00	applicationReason	gl-ES	Motivo de la sol·licitud	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.267118+00
5a701b2f-639c-40d4-8b7c-3cb868ac69de	2026-05-19 20:04:01.269389+00	applicationReason	va-ES	Motiu de la sol·licitud	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.269389+00
09212778-bab2-47d2-a89c-a04c0ac32714	2026-05-19 20:04:01.272247+00	householdIncomeRange	es-ES	Rango de ingresos	[{"value":"lt12000","label":"<12000"},{"value":"12000to24000","label":"12000-24000"},{"value":"gt24000","label":">24000"}]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.272247+00
d432c951-e0f2-4f1e-b1c8-c68ee1ceb714	2026-05-19 20:04:01.274789+00	householdIncomeRange	ca-ES	Rang d'ingressos	[{"value":"lt12000","label":"<12000"},{"value":"12000to24000","label":"12000-24000"},{"value":"gt24000","label":">24000"}]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.274789+00
1a87741f-41c1-41d1-9ec8-be2b525f6a21	2026-05-19 20:04:01.277113+00	householdIncomeRange	eu-ES	Diru-sartze tartea	[{"value":"lt12000","label":"<12000"},{"value":"12000to24000","label":"12000-24000"},{"value":"gt24000","label":">24000"}]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.277113+00
0edf5844-6409-46f1-8d2c-88f462a181a2	2026-05-19 20:04:01.28049+00	householdIncomeRange	gl-ES	Rang d'ingressos	[{"value":"lt12000","label":"<12000"},{"value":"12000to24000","label":"12000-24000"},{"value":"gt24000","label":">24000"}]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.28049+00
5d99bc82-593f-44c3-9de1-f72250366b97	2026-05-19 20:04:01.283031+00	householdIncomeRange	va-ES	Rang d'ingressos	[{"value":"lt12000","label":"<12000"},{"value":"12000to24000","label":"12000-24000"},{"value":"gt24000","label":">24000"}]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.283031+00
8c4dfcbb-a487-47e6-b87f-1109d8e96e09	2026-05-19 20:04:01.285397+00	householdSize	es-ES	Numero de convivientes	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.285397+00
308bef4a-55b3-4928-bbf0-53f3e3edb853	2026-05-19 20:04:01.288046+00	householdSize	ca-ES	Nombre de convivents	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.288046+00
9da5668d-2399-4640-9cf9-46e5bfeb1120	2026-05-19 20:04:01.290905+00	householdSize	eu-ES	Bizikide kopurua	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.290905+00
947ff8b0-e2f3-44ab-b40d-716cfe0bd8db	2026-05-19 20:04:01.293484+00	householdSize	gl-ES	Nombre de convivents	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.293484+00
d7b5bf3a-5b2b-42a3-a249-78a7162c047e	2026-05-19 20:04:01.296393+00	householdSize	va-ES	Nombre de convivents	[]		7698210e-88bf-4a61-8cca-4690ed0aefef	0	2026-05-19 20:04:01.296393+00
cbc652a6-b9f3-4641-adcf-037134be2338	2026-05-19 20:04:01.326899+00	applicantFullName	es-ES	Nombre completo	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.326899+00
a878df72-4e64-4a0b-9083-9cd5466b991c	2026-05-19 20:04:01.329681+00	applicantFullName	ca-ES	Nom complet	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.329681+00
7ca03559-686f-4582-9946-cb6653433c29	2026-05-19 20:04:01.333194+00	applicantFullName	eu-ES	Izen-abizenak	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.333194+00
9e5bfbd0-bd55-4079-8f5d-c91c48017da9	2026-05-19 20:04:01.336433+00	applicantFullName	gl-ES	Nome completo	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.336433+00
ba9c95a2-83ea-40c8-bc33-7342eb04055a	2026-05-19 20:04:01.339554+00	applicantFullName	va-ES	Nom complet	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.339554+00
5b9470cd-8fac-4052-9150-cf42f00abe5b	2026-05-19 20:04:01.34255+00	applicantEmail	es-ES	Correo electronico	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.34255+00
2701ecaf-9403-4366-88ce-8297688e6eb4	2026-05-19 20:04:01.345497+00	applicantEmail	ca-ES	Correu electrònic	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.345497+00
bdad340a-affd-48b9-87e7-eb841ef10d65	2026-05-19 20:04:01.349169+00	applicantEmail	eu-ES	Posta elektronikoa	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.349169+00
b2efb3a0-300b-4795-9b01-ae41c9e75340	2026-05-19 20:04:01.352463+00	applicantEmail	gl-ES	Correu electrònic	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.352463+00
071b9e89-8372-4fcf-9d8a-3ccdb36013d0	2026-05-19 20:04:01.355462+00	applicantEmail	va-ES	Correu electrònic	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.355462+00
9d6f22e3-c284-4d55-8392-73bb75db878b	2026-05-19 20:04:01.358395+00	applicationReason	es-ES	Motivo de la solicitud	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.358395+00
0ec4b6df-1df0-458a-ac20-8dea247e066a	2026-05-19 20:04:01.361091+00	applicationReason	ca-ES	Motiu de la sol·licitud	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.361091+00
857ed3e6-b015-4ed3-a881-d8b6ba5fe629	2026-05-19 20:04:01.363656+00	applicationReason	eu-ES	Eskaeraren arrazoia	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.363656+00
f6802315-c82a-46f1-aa85-15781719fdf6	2026-05-19 20:04:01.367821+00	applicationReason	gl-ES	Motivo de la sol·licitud	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.367821+00
0fb42843-2a8e-4eb2-b1cd-c2b7c4dab28e	2026-05-19 20:04:01.371164+00	applicationReason	va-ES	Motiu de la sol·licitud	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.371164+00
f2b6a6c2-8cee-4b89-b59c-3bbda7d85c4d	2026-05-19 20:04:01.374275+00	eventName	es-ES	Nombre del evento	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.374275+00
2fd4a95f-f20e-44a4-9320-619ea6ee7167	2026-05-19 20:04:01.377089+00	eventName	ca-ES	Nom de l'esdeveniment	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.377089+00
1b47f93d-3dc9-45b2-92a7-c253aa473183	2026-05-19 20:04:01.379685+00	eventName	eu-ES	Ekitaldiaren izena	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.379685+00
ca868d98-1423-4ecb-9c0b-6d436445faa3	2026-05-19 20:04:01.383031+00	eventName	gl-ES	Nom de l'esdeveniment	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.383031+00
44196c97-e3d1-43ea-95c4-74f7e8a1f66f	2026-05-19 20:04:01.387469+00	eventName	va-ES	Nom de l'esdeveniment	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.387469+00
d12c0ed7-0cdd-4335-befd-847898368717	2026-05-19 20:04:01.390437+00	expectedAttendance	es-ES	Aforo estimado	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.390437+00
77110f1a-e840-47e4-a450-566aea247449	2026-05-19 20:04:01.393074+00	expectedAttendance	ca-ES	Aforament estimat	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.393074+00
085c765d-9851-42af-85f1-e4e7295c3e0a	2026-05-19 20:04:01.395696+00	expectedAttendance	eu-ES	Aurreikusitako edukiera	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.395696+00
d6bd5f72-725b-4f83-8e25-aedb7162ab7a	2026-05-19 20:04:01.398095+00	expectedAttendance	gl-ES	Aforament estimat	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.398095+00
a1e59a46-7a3e-4230-b5d8-007ca084e350	2026-05-19 20:04:01.40072+00	expectedAttendance	va-ES	Aforament estimat	[]		23ca7468-b830-4c8b-87f4-77534e5f7d1a	0	2026-05-19 20:04:01.40072+00
d5747039-6305-4278-bed1-6d24c611ec8f	2026-05-19 20:04:01.43463+00	applicantFullName	es-ES	Nombre completo	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.43463+00
244e8ef2-8d44-4a37-9f54-6ada88be462d	2026-05-19 20:04:01.437232+00	applicantFullName	ca-ES	Nom complet	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.437232+00
77b48ad6-27ee-41b9-b523-e079bf6f106c	2026-05-19 20:04:01.440798+00	applicantFullName	eu-ES	Izen-abizenak	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.440798+00
c6d82941-1574-4b27-a1f5-68ad70557688	2026-05-19 20:04:01.443828+00	applicantFullName	gl-ES	Nome completo	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.443828+00
4a3deb0c-c0e3-4dfb-b7ca-4e76be4135a0	2026-05-19 20:04:01.446251+00	applicantFullName	va-ES	Nom complet	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.446251+00
80eb22ce-356e-4ca3-a3a6-dcc1b66f3ad9	2026-05-19 20:04:01.448546+00	applicantEmail	es-ES	Correo electronico	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.448546+00
6e2abb7a-6dd0-40fe-93f3-de40d188bbcc	2026-05-19 20:04:01.451076+00	applicantEmail	ca-ES	Correu electrònic	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.451076+00
3f8a49cb-52a6-4541-8d5a-001391da635e	2026-05-19 20:04:01.453694+00	applicantEmail	eu-ES	Posta elektronikoa	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.453694+00
c33b2f7a-ff01-4120-ac5d-bbbac473b735	2026-05-19 20:04:01.456322+00	applicantEmail	gl-ES	Correu electrònic	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.456322+00
e70043e4-449c-4bc8-b2d9-9ded1b093ea7	2026-05-19 20:04:01.459952+00	applicantEmail	va-ES	Correu electrònic	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.459952+00
c8385f17-7b50-4f4a-88e6-8fd2318aff69	2026-05-19 20:04:01.462718+00	applicationReason	es-ES	Motivo de la solicitud	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.462718+00
3608ba92-6a37-4fd1-8145-c236a12f3aa4	2026-05-19 20:04:01.465266+00	applicationReason	ca-ES	Motiu de la sol·licitud	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.465266+00
6c3deec8-ce3f-48b6-9788-de1e22964661	2026-05-19 20:04:01.467989+00	applicationReason	eu-ES	Eskaeraren arrazoia	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.467989+00
62a44eee-b8db-4a84-9828-6ba24a3c02d9	2026-05-19 20:04:01.470761+00	applicationReason	gl-ES	Motivo de la sol·licitud	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.470761+00
7f9dfdcb-e59a-4523-89d2-7f72d2d56683	2026-05-19 20:04:01.473613+00	applicationReason	va-ES	Motiu de la sol·licitud	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.473613+00
8f07f45b-fb7d-4e82-8c6e-b901a051d12f	2026-05-19 20:04:01.477325+00	treeLocation	es-ES	Ubicacion del arbol	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.477325+00
5e972ba2-cc65-4f95-8ca7-60aac78733ea	2026-05-19 20:04:01.480321+00	treeLocation	ca-ES	Ubicació de l'arbre	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.480321+00
78aaca83-1ebe-44a3-998a-774d2f0a8267	2026-05-19 20:04:01.483064+00	treeLocation	eu-ES	Zuhaitzaren kokapena	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.483064+00
0630fecf-9e73-449a-bc84-842b3741bd0d	2026-05-19 20:04:01.485652+00	treeLocation	gl-ES	Ubicació de l'arbre	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.485652+00
9f560312-0991-4f57-843d-86dae9659b89	2026-05-19 20:04:01.488392+00	treeLocation	va-ES	Ubicació de l'arbre	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.488392+00
9a0e4e71-7541-4751-8966-74af265c8fb1	2026-05-19 20:04:01.491021+00	pruningJustification	es-ES	Motivo de poda	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.491021+00
4594d36a-c2d8-4ec2-a839-1beca66937a9	2026-05-19 20:04:01.493741+00	pruningJustification	ca-ES	Motiu de poda	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.493741+00
42e5fd77-751d-4563-93e6-5ce7ae00e6c4	2026-05-19 20:04:01.497562+00	pruningJustification	eu-ES	Mozketa arrazoia	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.497562+00
a62d81c9-3f73-486f-9e10-ec0bc470562d	2026-05-19 20:04:01.499997+00	pruningJustification	gl-ES	Motiu de poda	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.499997+00
d801649c-4a99-43ee-8762-16573a2832cc	2026-05-19 20:04:01.502299+00	pruningJustification	va-ES	Motiu de poda	[]		02801fa1-3a58-4ca2-b2f9-b22308d8ec22	0	2026-05-19 20:04:01.502299+00
\.


ALTER TABLE public.procedure_task_field_i18n ENABLE TRIGGER ALL;

--
-- Data for Name: procedure_task_i18n; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.procedure_task_i18n DISABLE TRIGGER ALL;

COPY public.procedure_task_i18n (id, created_at, description, locale, procedure_type_id, task_order_index, title, updated_at) FROM stdin;
\.


ALTER TABLE public.procedure_task_i18n ENABLE TRIGGER ALL;

--
-- Data for Name: procedure_tasks; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.procedure_tasks DISABLE TRIGGER ALL;

COPY public.procedure_tasks (id, created_at, description, form_schema, order_index, procedure_type_id, title, type, updated_at, upload_requirements) FROM stdin;
c8cf2fa6-cabb-443e-9a21-f1329a2c0ae0	2026-05-19 20:04:00.025808+00	Provide applicant data for registry certificate	[\n  {"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},\n  {"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},\n  {"id":"applicationReason","label":"Motivo de la solicitud","type":"textarea","required":true,"options":[]},\n  {"id":"certificateType","label":"Tipo de certificado","type":"select","required":true,"options":[{"value":"padron","label":"Padron"},{"value":"convivencia","label":"Convivencia"},{"value":"residencia","label":"Residencia"}]},\n{"id":"certificatePurpose","label":"Finalidad","type":"textarea","required":false,"options":[]}\n\n]\n	0	ebeba1d1-ec1b-4a75-a494-f2d485243e65	Applicant Data	FORM	2026-05-19 20:04:00.025808+00	\N
48731225-036c-4341-acab-1130c64804ab	2026-05-19 20:04:00.030326+00	Upload required documents for registry certificate	\N	1	ebeba1d1-ec1b-4a75-a494-f2d485243e65	Supporting Documents	UPLOAD	2026-05-19 20:04:00.030326+00	\N
074dc1e8-8750-4314-ab40-01887131c9c3	2026-05-19 20:04:00.034779+00	Review and submit registry certificate	\N	2	ebeba1d1-ec1b-4a75-a494-f2d485243e65	Confirmation	REVIEW	2026-05-19 20:04:00.034779+00	\N
e532e798-bb8e-407e-9459-04b6e03fcd6e	2026-05-19 20:04:00.27742+00	Provide applicant data for address update	[\n  {"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},\n  {"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},\n  {"id":"applicationReason","label":"Motivo de la solicitud","type":"textarea","required":true,"options":[]},\n  {"id":"currentAddress","label":"Direccion actual","type":"text","required":true,"options":[]},\n{"id":"newAddress","label":"Nueva direccion","type":"text","required":true,"options":[]}\n\n]\n	0	7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	Applicant Data	FORM	2026-05-19 20:04:00.27742+00	\N
68474d92-7622-411f-b302-352bf97bb9af	2026-05-19 20:04:00.283728+00	Upload required documents for address update	\N	1	7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	Supporting Documents	UPLOAD	2026-05-19 20:04:00.283728+00	\N
a13532ee-c6f2-4119-8161-4a6966f3b882	2026-05-19 20:04:00.289164+00	Review and submit address update	\N	2	7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	Confirmation	REVIEW	2026-05-19 20:04:00.289164+00	\N
eda17fe6-4ef3-4162-ba85-eeb4e70dbe14	2026-05-19 20:04:00.441531+00	Provide applicant data for building permit	[\n  {"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},\n  {"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},\n  {"id":"applicationReason","label":"Motivo de la solicitud","type":"textarea","required":true,"options":[]},\n  {"id":"workType","label":"Tipo de obra","type":"select","required":true,"options":[{"value":"minor","label":"Menor"},{"value":"major","label":"Mayor"},{"value":"renovation","label":"Reforma"}]},\n{"id":"plotReference","label":"Referencia catastral","type":"text","required":true,"options":[]}\n\n]\n	0	58047cd7-a841-420b-b717-94e17d9d017a	Applicant Data	FORM	2026-05-19 20:04:00.441531+00	\N
1369f180-4985-4c75-9985-1e9994000bd1	2026-05-19 20:04:00.445398+00	Upload required documents for building permit	\N	1	58047cd7-a841-420b-b717-94e17d9d017a	Supporting Documents	UPLOAD	2026-05-19 20:04:00.445398+00	\N
dc95712e-3339-44c7-b099-b0f865bb0e0f	2026-05-19 20:04:00.450875+00	Review and submit building permit	\N	2	58047cd7-a841-420b-b717-94e17d9d017a	Confirmation	REVIEW	2026-05-19 20:04:00.450875+00	\N
f3b519ce-4004-4b86-aabb-eb365d0ec8eb	2026-05-19 20:04:00.589008+00	Provide applicant data for noise complaint	[\n  {"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},\n  {"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},\n  {"id":"applicationReason","label":"Motivo de la solicitud","type":"textarea","required":true,"options":[]},\n  {"id":"incidentAddress","label":"Ubicacion del ruido","type":"text","required":true,"options":[]},\n{"id":"incidentSchedule","label":"Horario habitual","type":"text","required":true,"options":[]}\n\n]\n	0	a0979ce0-21e1-4625-8da4-5cb8ab05c690	Applicant Data	FORM	2026-05-19 20:04:00.589008+00	\N
f1b4176e-7f12-4e3c-baa0-ee10dbd7aaab	2026-05-19 20:04:00.592435+00	Upload required documents for noise complaint	\N	1	a0979ce0-21e1-4625-8da4-5cb8ab05c690	Supporting Documents	UPLOAD	2026-05-19 20:04:00.592435+00	\N
3e4814b6-863f-486b-9698-572b32759d06	2026-05-19 20:04:00.59589+00	Review and submit noise complaint	\N	2	a0979ce0-21e1-4625-8da4-5cb8ab05c690	Confirmation	REVIEW	2026-05-19 20:04:00.59589+00	\N
e9ebe80c-be30-4b51-9b90-9e148abe5daf	2026-05-19 20:04:00.714195+00	Provide applicant data for street occupancy authorization	[\n  {"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},\n  {"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},\n  {"id":"applicationReason","label":"Motivo de la solicitud","type":"textarea","required":true,"options":[]},\n  {"id":"occupancyPurpose","label":"Motivo de ocupacion","type":"text","required":true,"options":[]},\n{"id":"occupancyDates","label":"Fechas previstas","type":"text","required":true,"options":[]}\n\n]\n	0	c67a82e3-fbae-465a-8237-569db71336f9	Applicant Data	FORM	2026-05-19 20:04:00.714195+00	\N
73094693-3550-48c0-8dc8-705045c2a1aa	2026-05-19 20:04:00.717409+00	Upload required documents for street occupancy authorization	\N	1	c67a82e3-fbae-465a-8237-569db71336f9	Supporting Documents	UPLOAD	2026-05-19 20:04:00.717409+00	\N
65670305-9df6-42ed-acce-261f23d4efdb	2026-05-19 20:04:00.720429+00	Review and submit street occupancy authorization	\N	2	c67a82e3-fbae-465a-8237-569db71336f9	Confirmation	REVIEW	2026-05-19 20:04:00.720429+00	\N
3c045c32-50fc-4327-be14-8a592c594662	2026-05-19 20:04:00.838313+00	Provide applicant data for business opening declaration	[\n  {"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},\n  {"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},\n  {"id":"applicationReason","label":"Motivo de la solicitud","type":"textarea","required":true,"options":[]},\n  {"id":"economicActivityCode","label":"Epigrafe de actividad","type":"text","required":true,"options":[]},\n{"id":"openingDate","label":"Fecha prevista de apertura","type":"text","required":true,"options":[]}\n\n]\n	0	5727b53e-163d-4722-b8cc-f6deafb63a5d	Applicant Data	FORM	2026-05-19 20:04:00.838313+00	\N
c1b876c0-de70-4f71-965c-6870cad349a8	2026-05-19 20:04:00.841613+00	Upload required documents for business opening declaration	\N	1	5727b53e-163d-4722-b8cc-f6deafb63a5d	Supporting Documents	UPLOAD	2026-05-19 20:04:00.841613+00	\N
88ce5d46-b598-4003-8f40-5f0639c92872	2026-05-19 20:04:00.846006+00	Review and submit business opening declaration	\N	2	5727b53e-163d-4722-b8cc-f6deafb63a5d	Confirmation	REVIEW	2026-05-19 20:04:00.846006+00	\N
bda045a9-3dde-49d1-980a-39a2ad0a10b8	2026-05-19 20:04:00.965879+00	Provide applicant data for tax rebate request	[\n  {"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},\n  {"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},\n  {"id":"applicationReason","label":"Motivo de la solicitud","type":"textarea","required":true,"options":[]},\n  {"id":"taxReference","label":"Referencia tributaria","type":"text","required":true,"options":[]},\n{"id":"rebateReason","label":"Causa de la bonificacion","type":"textarea","required":true,"options":[]}\n\n]\n	0	0b32b806-8d18-4aa9-baaa-b441e361a177	Applicant Data	FORM	2026-05-19 20:04:00.965879+00	\N
27690228-e0e4-44e3-be6d-33e7f0472166	2026-05-19 20:04:00.969085+00	Upload required documents for tax rebate request	\N	1	0b32b806-8d18-4aa9-baaa-b441e361a177	Supporting Documents	UPLOAD	2026-05-19 20:04:00.969085+00	\N
e347e73a-6da0-44ef-9cce-2388de036c70	2026-05-19 20:04:00.972078+00	Review and submit tax rebate request	\N	2	0b32b806-8d18-4aa9-baaa-b441e361a177	Confirmation	REVIEW	2026-05-19 20:04:00.972078+00	\N
3de98296-e9ff-4354-a37d-81f9d510899f	2026-05-19 20:04:01.089954+00	Provide applicant data for household registration	[\n  {"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},\n  {"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},\n  {"id":"applicationReason","label":"Motivo de la solicitud","type":"textarea","required":true,"options":[]},\n  {"id":"householdMemberName","label":"Nombre del nuevo miembro","type":"text","required":true,"options":[]},\n{"id":"relationshipType","label":"Relacion con titular","type":"select","required":true,"options":[{"value":"spouse","label":"Conyuge"},{"value":"child","label":"Hijo/a"},{"value":"ward","label":"Tutorado/a"},{"value":"other","label":"Otro"}]}\n\n]\n	0	0b7d866d-bcb0-4691-86b9-1d96f8325875	Applicant Data	FORM	2026-05-19 20:04:01.089954+00	\N
16130742-94c9-4588-9a76-43be7253ee1a	2026-05-19 20:04:01.094493+00	Upload required documents for household registration	\N	1	0b7d866d-bcb0-4691-86b9-1d96f8325875	Supporting Documents	UPLOAD	2026-05-19 20:04:01.094493+00	\N
90d94992-c3fa-4422-99ff-be393a30ec7d	2026-05-19 20:04:01.097558+00	Review and submit household registration	\N	2	0b7d866d-bcb0-4691-86b9-1d96f8325875	Confirmation	REVIEW	2026-05-19 20:04:01.097558+00	\N
27eb99f1-a1ed-4d70-be01-eaf3e4ae63b4	2026-05-19 20:04:01.202157+00	Provide applicant data for social aid application	[\n  {"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},\n  {"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},\n  {"id":"applicationReason","label":"Motivo de la solicitud","type":"textarea","required":true,"options":[]},\n  {"id":"householdIncomeRange","label":"Rango de ingresos","type":"select","required":true,"options":[{"value":"lt12000","label":"<12000"},{"value":"12000to24000","label":"12000-24000"},{"value":"gt24000","label":">24000"}]},\n{"id":"householdSize","label":"Numero de convivientes","type":"text","required":true,"options":[]}\n\n]\n	0	7698210e-88bf-4a61-8cca-4690ed0aefef	Applicant Data	FORM	2026-05-19 20:04:01.202157+00	\N
8f5fe2e1-cd03-44d2-8bc2-1e3c6a38af3d	2026-05-19 20:04:01.204895+00	Upload required documents for social aid application	\N	1	7698210e-88bf-4a61-8cca-4690ed0aefef	Supporting Documents	UPLOAD	2026-05-19 20:04:01.204895+00	\N
c7672ee5-a6ba-4aee-94c2-89248a98ea25	2026-05-19 20:04:01.20756+00	Review and submit social aid application	\N	2	7698210e-88bf-4a61-8cca-4690ed0aefef	Confirmation	REVIEW	2026-05-19 20:04:01.20756+00	\N
32eb714b-a09e-4e75-848f-addd8445130c	2026-05-19 20:04:01.302452+00	Provide applicant data for cultural event authorization	[\n  {"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},\n  {"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},\n  {"id":"applicationReason","label":"Motivo de la solicitud","type":"textarea","required":true,"options":[]},\n  {"id":"eventName","label":"Nombre del evento","type":"text","required":true,"options":[]},\n{"id":"expectedAttendance","label":"Aforo estimado","type":"text","required":true,"options":[]}\n\n]\n	0	23ca7468-b830-4c8b-87f4-77534e5f7d1a	Applicant Data	FORM	2026-05-19 20:04:01.302452+00	\N
d7b5ec7d-b2ae-4487-8778-247eebf43b09	2026-05-19 20:04:01.305522+00	Upload required documents for cultural event authorization	\N	1	23ca7468-b830-4c8b-87f4-77534e5f7d1a	Supporting Documents	UPLOAD	2026-05-19 20:04:01.305522+00	\N
e8e222b6-9938-4373-9c2e-556b5f723a9b	2026-05-19 20:04:01.308356+00	Review and submit cultural event authorization	\N	2	23ca7468-b830-4c8b-87f4-77534e5f7d1a	Confirmation	REVIEW	2026-05-19 20:04:01.308356+00	\N
d7811bb1-0b52-46b8-9347-be23b9169864	2026-05-19 20:04:01.408607+00	Provide applicant data for tree pruning request	[\n  {"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},\n  {"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},\n  {"id":"applicationReason","label":"Motivo de la solicitud","type":"textarea","required":true,"options":[]},\n  {"id":"treeLocation","label":"Ubicacion del arbol","type":"text","required":true,"options":[]},\n{"id":"pruningJustification","label":"Motivo de poda","type":"textarea","required":true,"options":[]}\n\n]\n	0	02801fa1-3a58-4ca2-b2f9-b22308d8ec22	Applicant Data	FORM	2026-05-19 20:04:01.408607+00	\N
0db7a018-5d66-4793-9ea7-2cab92075f7c	2026-05-19 20:04:01.411218+00	Upload required documents for tree pruning request	\N	1	02801fa1-3a58-4ca2-b2f9-b22308d8ec22	Supporting Documents	UPLOAD	2026-05-19 20:04:01.411218+00	\N
0693e2d0-d8dc-41f1-846c-80b99a91c514	2026-05-19 20:04:01.41361+00	Review and submit tree pruning request	\N	2	02801fa1-3a58-4ca2-b2f9-b22308d8ec22	Confirmation	REVIEW	2026-05-19 20:04:01.41361+00	\N
c934af6b-5234-4788-8376-f8af2f87e515	2026-06-02 20:53:37.142924+00	Provide applicant data for license application	[{"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},{"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},{"id":"applicationReason","label":"Motivo de la solicitud","type":"textarea","required":true,"options":[]},{"id":"businessName","label":"Nombre de la actividad","type":"text","required":true,"options":[]},{"id":"premisesAddress","label":"Direccion del local","type":"text","required":true,"options":[]}]	0	a98135be-77fc-43f5-a6bf-e85ec5633ba5	Applicant Data	FORM	2026-06-02 20:53:37.142924+00	\N
0fcd35e1-cf7a-43ae-aa11-96a2bfc65d40	2026-06-02 20:53:37.157835+00	Upload required documents for license application	\N	1	a98135be-77fc-43f5-a6bf-e85ec5633ba5	Supporting Documents	UPLOAD	2026-06-02 20:53:37.157835+00	\N
7e984c4a-0a2a-43d2-b0ef-297346867b22	2026-06-02 20:53:37.162899+00	Review and submit license application	\N	2	a98135be-77fc-43f5-a6bf-e85ec5633ba5	Confirmation	REVIEW	2026-06-02 20:53:37.162899+00	\N
7b5f29b0-0d5c-4664-946b-25811a282a5f	2026-06-02 21:00:54.048752+00	Recoger datos iniciales y verificar documentacion obligatoria	[{"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},{"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},{"id":"procedureScope","label":"Ambito del tramite","type":"select","required":true,"options":["Municipal","Supramunicipal"]},{"id":"documentationComplete","label":"Documentacion completa","type":"select","required":true,"options":["true","false"]},{"id":"technicalNotes","label":"Observaciones tecnicas","type":"textarea","required":false,"options":[]}]	0	7fecfeac-761c-4549-ad36-e55d851cf0af	Recepcion y verificacion inicial	FORM	2026-06-02 21:00:54.048752+00	\N
2ee8925d-07ee-4903-9abe-7bb8368ae66d	2026-06-02 21:00:54.05509+00	Adjuntar evidencias y anexos tecnicos	\N	1	7fecfeac-761c-4549-ad36-e55d851cf0af	Aportacion documental	UPLOAD	2026-06-02 21:00:54.05509+00	\N
f355f332-46e2-456e-95ae-766d4cbb8b2e	2026-06-02 21:00:54.056862+00	Evaluacion final para aprobacion o rechazo	\N	2	7fecfeac-761c-4549-ad36-e55d851cf0af	Revision de cumplimiento	REVIEW	2026-06-02 21:00:54.056862+00	\N
958c3905-082a-4895-994a-2ecaf1cbdf40	2026-06-02 22:04:11.356189+00		[{"id":"field_1780437395336","label":"Nuevo campo","type":"text","required":false,"options":null},{"id":"field_1780437395825","label":"Nuevo campo","type":"text","required":false,"options":null},{"id":"field_1780437396201","label":"Nuevo campo","type":"text","required":false,"options":null},{"id":"field_1780437396409","label":"Nuevo campo","type":"text","required":false,"options":null},{"id":"field_1780437396592","label":"Nuevo campo","type":"text","required":false,"options":null},{"id":"field_1780437396768","label":"Nuevo campo","type":"text","required":false,"options":null}]	0	2f829662-5031-4501-bfd3-b6e5d3f17224	Nueva tarea 1	FORM	2026-06-02 22:04:11.356189+00	\N
24c3825d-34eb-45f5-a88d-6f696636b227	2026-06-02 22:04:11.368807+00		\N	1	2f829662-5031-4501-bfd3-b6e5d3f17224	Nueva tarea 2	UPLOAD	2026-06-02 22:04:11.368807+00	\N
8aa06fd5-1204-478b-93d2-2809a86c93f3	2026-06-02 22:04:11.372116+00		[{"id":"field_1780437414784","label":"Nuevo campo","type":"text","required":false,"options":null},{"id":"field_1780437414960","label":"Nuevo campo","type":"text","required":false,"options":null},{"id":"field_1780437415144","label":"Nuevo campo","type":"text","required":false,"options":null},{"id":"field_1780437415329","label":"Nuevo campo","type":"text","required":false,"options":null}]	2	2f829662-5031-4501-bfd3-b6e5d3f17224	Nueva tarea 3	FORM	2026-06-02 22:04:11.372116+00	\N
2288727d-f829-4352-946f-4a7a710dc3ae	2026-06-02 22:04:11.375604+00		[{"id":"field_1780437831292","label":"Nuevo campo","type":"text","required":false,"options":null}]	3	2f829662-5031-4501-bfd3-b6e5d3f17224	Nueva tarea 4	FORM	2026-06-02 22:04:11.375604+00	\N
fc9662d8-5d37-4b94-9b4a-a511dbd24ab0	2026-06-02 22:04:11.379481+00		\N	4	2f829662-5031-4501-bfd3-b6e5d3f17224	Nueva tarea 5	UPLOAD	2026-06-02 22:04:11.379481+00	\N
419e7ecb-c3a8-4289-9c9a-1cf15b1fac2c	2026-06-02 22:04:11.382744+00		[{"id":"field_1780437848385","label":"Nuevo campo","type":"text","required":false,"options":null},{"id":"field_1780437848641","label":"Nuevo campo","type":"text","required":false,"options":null},{"id":"field_1780437848913","label":"Nuevo campo","type":"text","required":false,"options":null}]	5	2f829662-5031-4501-bfd3-b6e5d3f17224	Nueva tarea 6	FORM	2026-06-02 22:04:11.382744+00	\N
\.


ALTER TABLE public.procedure_tasks ENABLE TRIGGER ALL;

--
-- Data for Name: procedure_type_i18n; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.procedure_type_i18n DISABLE TRIGGER ALL;

COPY public.procedure_type_i18n (id, created_at, description, locale, procedure_type_id, title, unit, updated_at) FROM stdin;
373f1202-0d69-49a2-a7a8-129977fd2e75	2026-05-19 20:03:59.77514+00	Solicite una licencia para nueva actividad o negocio. Inicia el flujo BPM genérico de procedimiento ciudadano.	es-ES	a98135be-77fc-43f5-a6bf-e85ec5633ba5	Solicitud de Licencia	Unidad de Licencias	2026-05-19 20:03:59.77514+00
38202e33-fb8d-4afd-8966-9f137714c7a0	2026-05-19 20:03:59.783271+00	Sol·liciteu una llicència per a nova activitat o negoci. Inicia el flux BPM genèric de procediment ciutadà.	ca-ES	a98135be-77fc-43f5-a6bf-e85ec5633ba5	Sol·licitud de Llicència	Unitat de Llicències	2026-05-19 20:03:59.783271+00
fe2b516f-2ee2-4e08-b228-e7fd87d30387	2026-05-19 20:03:59.791142+00	Jarduera edo negozio berrirako lizentzia eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.	eu-ES	a98135be-77fc-43f5-a6bf-e85ec5633ba5	Lizentzia Eskaera	Lizentzia Unitatea	2026-05-19 20:03:59.791142+00
72c17d90-4496-4224-8a5d-467c8960fb7f	2026-05-19 20:03:59.796189+00	Solicite unha licenza para nova actividade ou negocio. Inicia o fluxo BPM xenérico de procedemento cidadán.	gl-ES	a98135be-77fc-43f5-a6bf-e85ec5633ba5	Solicitude de Licenza	Unidade de Licenzas	2026-05-19 20:03:59.796189+00
e479d2d1-dacb-4331-b799-c0c05ad992dd	2026-05-19 20:03:59.802385+00	Sol·liciteu una llicència per a nova activitat o negoci. Inicia el flux BPM genèric de procediment ciutadà.	va-ES	a98135be-77fc-43f5-a6bf-e85ec5633ba5	Sol·licitud de Llicència	Unitat de Llicències	2026-05-19 20:03:59.802385+00
7a05c4a1-a44f-4705-baf7-0266f71a22c0	2026-05-19 20:04:00.040519+00	Solicite un certificado registral oficial. Inicia el flujo BPM genérico de procedimiento ciudadano.	es-ES	ebeba1d1-ec1b-4a75-a494-f2d485243e65	Certificado Registral	Oficina del Registro	2026-05-19 20:04:00.040519+00
41c11fd1-8d42-4f23-ae1d-92616583ab92	2026-05-19 20:04:00.045872+00	Sol·liciteu un certificat registral oficial. Inicia el flux BPM genèric de procediment ciutadà.	ca-ES	ebeba1d1-ec1b-4a75-a494-f2d485243e65	Certificat Registral	Oficina del Registre	2026-05-19 20:04:00.045872+00
603282ef-ae65-42b5-a205-3e2d90e540be	2026-05-19 20:04:00.049989+00	Erregistro ziurtagiri ofiziala eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.	eu-ES	ebeba1d1-ec1b-4a75-a494-f2d485243e65	Erregistro Ziurtagiria	Erregistro Bulegoa	2026-05-19 20:04:00.049989+00
0ec153f1-95b1-44f8-974a-f94dcfdbcbbc	2026-05-19 20:04:00.056506+00	Solicite un certificado rexistral oficial. Inicia o fluxo BPM xenérico de procedemento cidadán.	gl-ES	ebeba1d1-ec1b-4a75-a494-f2d485243e65	Certificado Rexistral	Oficina do Rexistro	2026-05-19 20:04:00.056506+00
0c77e532-b76d-4b95-b1e3-5307a0c9390c	2026-05-19 20:04:00.06371+00	Sol·liciteu un certificat registral oficial. Inicia el flux BPM genèric de procediment ciutadà.	va-ES	ebeba1d1-ec1b-4a75-a494-f2d485243e65	Certificat Registral	Oficina del Registre	2026-05-19 20:04:00.06371+00
cfc5404f-1cff-4049-92fc-c876108de6c3	2026-05-19 20:04:00.295905+00	Actualice su domicilio registrado. Inicia el flujo BPM genérico de procedimiento ciudadano.	es-ES	7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	Actualización de Domicilio	Servicios Ciudadanos	2026-05-19 20:04:00.295905+00
1f13f3a0-1c12-43f0-b156-84bde4f45813	2026-05-19 20:04:00.300688+00	Actualitzeu el vostre domicili registrat. Inicia el flux BPM genèric de procediment ciutadà.	ca-ES	7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	Actualització de Domicili	Serveis Ciutadans	2026-05-19 20:04:00.300688+00
564a0de2-25ed-40c3-97d9-f76297844297	2026-05-19 20:04:00.305806+00	Erroldatutako helbidea eguneratu. Herritarren prozedura BPM fluxu orokorra abiarazten du.	eu-ES	7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	Helbide Eguneraketa	Herritarren Zerbitzuak	2026-05-19 20:04:00.305806+00
95487390-9ea8-4cf1-965f-7b29893f69b1	2026-05-19 20:04:00.310562+00	Actualice o seu domicilio rexistrado. Inicia o fluxo BPM xenérico de procedemento cidadán.	gl-ES	7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	Actualización de Domicilio	Servizos Cidadáns	2026-05-19 20:04:00.310562+00
0cf31f71-f9e2-4493-a6cc-39439d684cbd	2026-05-19 20:04:00.315999+00	Actualitzeu el vostre domicili registrat. Inicia el flux BPM genèric de procediment ciutadà.	va-ES	7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	Actualització de Domicili	Serveis Ciutadans	2026-05-19 20:04:00.315999+00
f30cd4b5-b255-4080-8389-5ce3a4f7b0bd	2026-05-19 20:04:00.455125+00	Solicite una licencia municipal de obra. Inicia el flujo BPM genérico de procedimiento ciudadano.	es-ES	58047cd7-a841-420b-b717-94e17d9d017a	Licencia de Obra	Urbanismo	2026-05-19 20:04:00.455125+00
f277b4bd-b34a-4119-b532-03c980471689	2026-05-19 20:04:00.458702+00	Sol·liciteu una llicència municipal d'obra. Inicia el flux BPM genèric de procediment ciutadà.	ca-ES	58047cd7-a841-420b-b717-94e17d9d017a	Llicència d'Obra	Urbanisme	2026-05-19 20:04:00.458702+00
44c5e1c0-3705-4bce-938c-24bd40a33598	2026-05-19 20:04:00.462093+00	Udal obra lizentzia eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.	eu-ES	58047cd7-a841-420b-b717-94e17d9d017a	Obra Lizenzi	Hirigintza	2026-05-19 20:04:00.462093+00
41578912-7638-4b7f-b743-2e6c17874d78	2026-05-19 20:04:00.465614+00	Solicite unha licenza municipal de obra. Inicia o fluxo BPM xenérico de procedemento cidadán.	gl-ES	58047cd7-a841-420b-b717-94e17d9d017a	Licenza de Obra	Urbanismo	2026-05-19 20:04:00.465614+00
51345c0b-ba71-401b-a724-cf623daa418f	2026-05-19 20:04:00.471178+00	Sol·liciteu una llicència municipal d'obra. Inicia el flux BPM genèric de procediment ciutadà.	va-ES	58047cd7-a841-420b-b717-94e17d9d017a	Llicència d'Obra	Urbanisme	2026-05-19 20:04:00.471178+00
a90fc59b-ebf7-4ad4-83d4-4bb734a531c7	2026-05-19 20:04:00.599222+00	Denuncie incidentes recurrentes de ruido para inspección municipal. Inicia el flujo BPM genérico de procedimiento ciudadano.	es-ES	a0979ce0-21e1-4625-8da4-5cb8ab05c690	Denuncia por Ruidos	Unidad Medioambiental	2026-05-19 20:04:00.599222+00
084a9d14-b9de-4f68-85b4-3a504d9bb452	2026-05-19 20:04:00.602358+00	Denuncieu incidents recurrents de soroll per inspecció municipal. Inicia el flux BPM genèric de procediment ciutadà.	ca-ES	a0979ce0-21e1-4625-8da4-5cb8ab05c690	Denúncia per Sorolls	Unitat Mediambiental	2026-05-19 20:04:00.602358+00
541cc3a9-c3f5-44ff-898d-ae429757ed7e	2026-05-19 20:04:00.606768+00	Zarata incidentzia errekurrenteak salatu udal ikuskaritzarako. Herritarren prozedura BPM fluxu orokorra abiarazten du.	eu-ES	a0979ce0-21e1-4625-8da4-5cb8ab05c690	Zarata Salaketa	Ingurumen Unitatea	2026-05-19 20:04:00.606768+00
ea1a1dbe-8bed-4617-b9cf-48180a5ff553	2026-05-19 20:04:00.610149+00	Denuncie incidentes recorrentes de ruído para inspección municipal. Inicia o fluxo BPM xenérico de procedemento cidadán.	gl-ES	a0979ce0-21e1-4625-8da4-5cb8ab05c690	Denuncia por Ruídos	Unidade Medioambiental	2026-05-19 20:04:00.610149+00
c7c3eb9e-bd84-4c7d-8688-6ad3d0348ac6	2026-05-19 20:04:00.613793+00	Denuncieu incidents recurrents de soroll per inspecció municipal. Inicia el flux BPM genèric de procediment ciutadà.	va-ES	a0979ce0-21e1-4625-8da4-5cb8ab05c690	Denúncia per Sorolls	Unitat Mediambiental	2026-05-19 20:04:00.613793+00
431cb71a-4bae-4e45-89e3-c6bbe9216079	2026-05-19 20:04:00.723932+00	Solicite autorización para ocupar temporalmente espacio público. Inicia el flujo BPM genérico de procedimiento ciudadano.	es-ES	c67a82e3-fbae-465a-8237-569db71336f9	Autorización de Ocupación de Vía Pública	Oficina de Espacio Público	2026-05-19 20:04:00.723932+00
1a3f4d0e-e5b9-437b-8a53-5f66b48a2aa8	2026-05-19 20:04:00.72788+00	Sol·liciteu autorització per ocupar temporalment espai públic. Inicia el flux BPM genèric de procediment ciutadà.	ca-ES	c67a82e3-fbae-465a-8237-569db71336f9	Autorització d'Ocupació de Via Pública	Oficina d'Espai Públic	2026-05-19 20:04:00.72788+00
6db6da53-c2d9-4bd9-b1b3-0e72971fa0b5	2026-05-19 20:04:00.733105+00	Espazio publikoa behin-behinean okupatzeko baimena eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.	eu-ES	c67a82e3-fbae-465a-8237-569db71336f9	Bide Publikoaren Okupazio Baimena	Espazio Publikoaren Bulegoa	2026-05-19 20:04:00.733105+00
1066a8ac-a355-4dae-ab26-4513e782c1f7	2026-05-19 20:04:00.736078+00	Solicite autorización para ocupar temporalmente espazo público. Inicia o fluxo BPM xenérico de procedemento cidadán.	gl-ES	c67a82e3-fbae-465a-8237-569db71336f9	Autorización de Ocupación de Vía Pública	Oficina de Espazo Público	2026-05-19 20:04:00.736078+00
a0b5b69b-0fc9-4951-8d7b-d4c9fd7916e0	2026-05-19 20:04:00.739122+00	Sol·liciteu autorització per ocupar temporalment espai públic. Inicia el flux BPM genèric de procediment ciutadà.	va-ES	c67a82e3-fbae-465a-8237-569db71336f9	Autorització d'Ocupació de Via Pública	Oficina d'Espai Públic	2026-05-19 20:04:00.739122+00
009c45fa-14bd-46ee-a943-b02cee639e62	2026-05-19 20:04:00.849502+00	Presente una declaración para abrir una actividad comercial. Inicia el flujo BPM genérico de procedimiento ciudadano.	es-ES	5727b53e-163d-4722-b8cc-f6deafb63a5d	Declaración de Apertura de Negocio	Desarrollo Económico	2026-05-19 20:04:00.849502+00
524aa34a-654c-4085-9b89-7cde8402fbb9	2026-05-19 20:04:00.853029+00	Presenteu una declaració per obrir una activitat comercial. Inicia el flux BPM genèric de procediment ciutadà.	ca-ES	5727b53e-163d-4722-b8cc-f6deafb63a5d	Declaració d'Obertura de Negoci	Desenvolupament Econòmic	2026-05-19 20:04:00.853029+00
2d13f7f9-d51c-463b-bf4a-6ae9f3a3d435	2026-05-19 20:04:00.856707+00	Merkataritza jarduera irekitzeko adierazpena aurkeztu. Herritarren prozedura BPM fluxu orokorra abiarazten du.	eu-ES	5727b53e-163d-4722-b8cc-f6deafb63a5d	Negozio Irekieraren Adierazpena	Garapen Ekonomikoa	2026-05-19 20:04:00.856707+00
e405552a-d679-4dbe-9070-6b5e65a69c64	2026-05-19 20:04:00.860141+00	Presente unha declaración para abrir unha actividade comercial. Inicia o fluxo BPM xenérico de procedemento cidadán.	gl-ES	5727b53e-163d-4722-b8cc-f6deafb63a5d	Declaración de Apertura de Negocio	Desenvolvemento Económico	2026-05-19 20:04:00.860141+00
7e1aca77-f756-45cc-9052-ed737c22764d	2026-05-19 20:04:00.864689+00	Presenteu una declaració per obrir una activitat comercial. Inicia el flux BPM genèric de procediment ciutadà.	va-ES	5727b53e-163d-4722-b8cc-f6deafb63a5d	Declaració d'Obertura de Negoci	Desenvolupament Econòmic	2026-05-19 20:04:00.864689+00
bea640f9-f1e8-430a-82eb-6755083b7cfb	2026-05-19 20:04:00.975648+00	Solicite una bonificación fiscal municipal por circunstancias elegibles. Inicia el flujo BPM genérico de procedimiento ciudadano.	es-ES	0b32b806-8d18-4aa9-baaa-b441e361a177	Solicitud de Bonificación Fiscal	Oficina Tributaria	2026-05-19 20:04:00.975648+00
433a705f-d404-4b2f-a239-299a7135e50b	2026-05-19 20:04:00.978741+00	Sol·liciteu una bonificació fiscal municipal per circumstàncies elegibles. Inicia el flux BPM genèric de procediment ciutadà.	ca-ES	0b32b806-8d18-4aa9-baaa-b441e361a177	Sol·licitud de Bonificació Fiscal	Oficina Tributària	2026-05-19 20:04:00.978741+00
bbd79030-d996-4f40-9287-a9c6672526cc	2026-05-19 20:04:00.983004+00	Zerga hobari udala eskaera baldintza egokietarako. Herritarren prozedura BPM fluxu orokorra abiarazten du.	eu-ES	0b32b806-8d18-4aa9-baaa-b441e361a177	Zerga Hobari Eskaera	Zerga Bulegoa	2026-05-19 20:04:00.983004+00
4b2c09ef-b11b-4f95-ad56-881f48dc3132	2026-05-19 20:04:00.98599+00	Solicite unha bonificación fiscal municipal por circunstancias elixibles. Inicia o fluxo BPM xenérico de procedemento cidadán.	gl-ES	0b32b806-8d18-4aa9-baaa-b441e361a177	Solicitude de Bonificación Fiscal	Oficina Tributaria	2026-05-19 20:04:00.98599+00
5fec3754-c30b-4c9d-afe4-353386cf4f74	2026-05-19 20:04:00.989004+00	Sol·liciteu una bonificació fiscal municipal per circumstàncies elegibles. Inicia el flux BPM genèric de procediment ciutadà.	va-ES	0b32b806-8d18-4aa9-baaa-b441e361a177	Sol·licitud de Bonificació Fiscal	Oficina Tributària	2026-05-19 20:04:00.989004+00
bb8b0d2c-6229-47c9-bafd-04dd023303e4	2026-05-19 20:04:01.10082+00	Registre un familiar en un domicilio municipal. Inicia el flujo BPM genérico de procedimiento ciudadano.	es-ES	0b7d866d-bcb0-4691-86b9-1d96f8325875	Empadronamiento de Familiar	Registro de Población	2026-05-19 20:04:01.10082+00
b96e4c57-7e6f-4a2e-8667-9657cfa080ba	2026-05-19 20:04:01.104293+00	Registreu un familiar en un domicili municipal. Inicia el flux BPM genèric de procediment ciutadà.	ca-ES	0b7d866d-bcb0-4691-86b9-1d96f8325875	Empadronament de Familiar	Registre de Població	2026-05-19 20:04:01.104293+00
743159f5-9d29-4a64-97b6-a62da1da7b0c	2026-05-19 20:04:01.107433+00	Senidea udal batean erroldatu. Herritarren prozedura BPM fluxu orokorra abiarazten du.	eu-ES	0b7d866d-bcb0-4691-86b9-1d96f8325875	Senideen Errolda	Biztanleen Erregistroa	2026-05-19 20:04:01.107433+00
646fce50-af5d-4e39-b5d3-a6dbd226fa8d	2026-05-19 20:04:01.111193+00	Rexistre un familiar nun domicilio municipal. Inicia o fluxo BPM xenérico de procedemento cidadán.	gl-ES	0b7d866d-bcb0-4691-86b9-1d96f8325875	Empadroamento de Familiar	Rexistro de Poboación	2026-05-19 20:04:01.111193+00
87728ab6-895e-4328-bae2-7cf7299f0447	2026-05-19 20:04:01.114158+00	Registreu un familiar en un domicili municipal. Inicia el flux BPM genèric de procediment ciutadà.	va-ES	0b7d866d-bcb0-4691-86b9-1d96f8325875	Empadronament de Familiar	Registre de Població	2026-05-19 20:04:01.114158+00
f2bfd854-af39-4f5d-b25b-f639c4f964f9	2026-05-19 20:04:01.211236+00	Solicite apoyo de ayuda social municipal. Inicia el flujo BPM genérico de procedimiento ciudadano.	es-ES	7698210e-88bf-4a61-8cca-4690ed0aefef	Solicitud de Ayuda Social	Servicios Sociales	2026-05-19 20:04:01.211236+00
b2606ce6-c284-4427-9a18-f28af7bbfbfe	2026-05-19 20:04:01.214007+00	Sol·liciteu suport d'ajuda social municipal. Inicia el flux BPM genèric de procediment ciutadà.	ca-ES	7698210e-88bf-4a61-8cca-4690ed0aefef	Sol·licitud d'Ajuda Social	Serveis Socials	2026-05-19 20:04:01.214007+00
005bdb93-40de-430f-b041-511dc5d046eb	2026-05-19 20:04:01.21652+00	Udal laguntza sozialaren laguntza eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.	eu-ES	7698210e-88bf-4a61-8cca-4690ed0aefef	Laguntza Sozial Eskaera	Gizarte Zerbitzuak	2026-05-19 20:04:01.21652+00
80d15ba9-f3c9-492b-9190-c622e7b385ea	2026-05-19 20:04:01.219001+00	Solicite apoio de axuda social municipal. Inicia o fluxo BPM xenérico de procedemento cidadán.	gl-ES	7698210e-88bf-4a61-8cca-4690ed0aefef	Solicitude de Axuda Social	Servizos Sociais	2026-05-19 20:04:01.219001+00
d6010b66-ef49-40e2-b3e7-a7d21e728592	2026-05-19 20:04:01.221746+00	Sol·liciteu suport d'ajuda social municipal. Inicia el flux BPM genèric de procediment ciutadà.	va-ES	7698210e-88bf-4a61-8cca-4690ed0aefef	Sol·licitud d'Ajuda Social	Serveis Socials	2026-05-19 20:04:01.221746+00
fba9bdbc-9674-4c2c-a5cb-aca65234af4d	2026-05-19 20:04:01.311033+00	Solicite autorización para un evento cultural público. Inicia el flujo BPM genérico de procedimiento ciudadano.	es-ES	23ca7468-b830-4c8b-87f4-77534e5f7d1a	Autorización de Evento Cultural	Departamento de Cultura	2026-05-19 20:04:01.311033+00
21d8e9ee-f785-417b-af6c-18d318be7ec4	2026-05-19 20:04:01.314529+00	Sol·liciteu autorització per a un esdeveniment cultural públic. Inicia el flux BPM genèric de procediment ciutadà.	ca-ES	23ca7468-b830-4c8b-87f4-77534e5f7d1a	Autorització d'Esdeveniment Cultural	Departament de Cultura	2026-05-19 20:04:01.314529+00
034725ce-c8ea-4c8a-81bb-77989907a564	2026-05-19 20:04:01.317478+00	Ekitaldi kultur publikorako baimena eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.	eu-ES	23ca7468-b830-4c8b-87f4-77534e5f7d1a	Ekitaldi Kulturalerako Baimena	Kultura Saila	2026-05-19 20:04:01.317478+00
05702be2-762d-4fe6-ba88-63cbfda11241	2026-05-19 20:04:01.320071+00	Solicite autorización para un evento cultural público. Inicia o fluxo BPM xenérico de procedemento cidadán.	gl-ES	23ca7468-b830-4c8b-87f4-77534e5f7d1a	Autorización de Evento Cultural	Departamento de Cultura	2026-05-19 20:04:01.320071+00
d563a63f-ee43-4867-9632-f894f4ece681	2026-05-19 20:04:01.322873+00	Sol·liciteu autorització per a un esdeveniment cultural públic. Inicia el flux BPM genèric de procediment ciutadà.	va-ES	23ca7468-b830-4c8b-87f4-77534e5f7d1a	Autorització d'Esdeveniment Cultural	Departament de Cultura	2026-05-19 20:04:01.322873+00
cefdfd69-99c9-4bd0-b186-7d7a409b7543	2026-05-19 20:04:01.416428+00	Solicite la poda de árboles en zonas públicas. Inicia el flujo BPM genérico de procedimiento ciudadano.	es-ES	02801fa1-3a58-4ca2-b2f9-b22308d8ec22	Solicitud de Poda de Árboles	Parques y Jardines	2026-05-19 20:04:01.416428+00
d22fd18b-fe86-4666-a0b6-33703921b7d8	2026-05-19 20:04:01.419418+00	Sol·liciteu la poda d'arbres en zones públiques. Inicia el flux BPM genèric de procediment ciutadà.	ca-ES	02801fa1-3a58-4ca2-b2f9-b22308d8ec22	Sol·licitud de Poda d'Arbres	Parcs i Jardins	2026-05-19 20:04:01.419418+00
4eab52f6-197f-4ec9-a484-c6ac84599502	2026-05-19 20:04:01.423603+00	Zuhaitzak eremu publikoetan moztea eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.	eu-ES	02801fa1-3a58-4ca2-b2f9-b22308d8ec22	Zuhaitz Mozketa Eskaera	Parke eta Lorategiak	2026-05-19 20:04:01.423603+00
8615063b-c3de-4f98-815c-863a7df54ec1	2026-05-19 20:04:01.4272+00	Solicite a poda de árbores en zonas públicas. Inicia o fluxo BPM xenérico de procedemento cidadán.	gl-ES	02801fa1-3a58-4ca2-b2f9-b22308d8ec22	Solicitude de Poda de Árbores	Parques e Xardíns	2026-05-19 20:04:01.4272+00
bef41bc0-1785-4f46-ace0-e7cbe89202ae	2026-05-19 20:04:01.430347+00	Sol·liciteu la poda d'arbres en zones públiques. Inicia el flux BPM genèric de procediment ciutadà.	va-ES	02801fa1-3a58-4ca2-b2f9-b22308d8ec22	Sol·licitud de Poda d'Arbres	Parcs i Jardins	2026-05-19 20:04:01.430347+00
a1ef708a-bafe-47ed-86b7-e642c2a20e27	2026-05-22 12:08:58.111716+00	Procediment publicat per a proves del flux BPMN realista (documentacio, esmena, controls paral·lels i decisio final)	va-ES	7fecfeac-761c-4549-ad36-e55d851cf0af	Tramitacio avancada amb validacions ENS/ENI	Unitat d'Interoperabilitat	2026-05-22 12:08:58.111716+00
09b78c6a-cc43-4930-946d-d7f8a078d73d	2026-05-22 12:08:58.109362+00	Procediment publicat per a proves del flux BPMN realista (documentacio, esmena, controls paral·lels i decisio final)	ca-ES	7fecfeac-761c-4549-ad36-e55d851cf0af	Tramitacio avancada amb validacions ENS/ENI	Unitat d'Interoperabilitat	2026-05-22 12:08:58.109362+00
f3d25afe-c308-4119-a5eb-76f3fd9ca46e	2026-05-22 12:08:58.318934+00	BPMN fluxu errealistaren probetarako argitaratutako prozedura (dokumentazioa, zuzenketa, kontrol paraleloak eta azken erabakia)	eu-ES	7fecfeac-761c-4549-ad36-e55d851cf0af	ENS/ENI balidazioekin izapidetze aurreratua	Interoperabilitate Unitatea	2026-05-22 12:08:58.318934+00
695c8077-db3b-4838-b56b-37af0e30d576	2026-05-22 12:08:58.386382+00	Procedemento publicado para probas do fluxo BPMN realista (documentacion, emenda, controis paralelos e decision final)	gl-ES	7fecfeac-761c-4549-ad36-e55d851cf0af	Tramitacion avanzada con validacions ENS/ENI	Unidade de Interoperabilidade	2026-05-22 12:08:58.386382+00
c75f9e35-9878-45a6-81b4-407e0bfa1fa8	2026-06-02 20:46:13.829043+00	Procedimiento publicado para pruebas del flujo BPMN realista (documentacion, subsanacion, controles paralelos y decision final)	es-ES	7fecfeac-761c-4549-ad36-e55d851cf0af	Tramitacion avanzada con validaciones ENS/ENI	Unidad de Interoperabilidad	2026-06-02 20:46:13.829043+00
74f7e26e-220f-46f6-abb0-6c5e2ba2d5f7	2026-06-02 20:54:57.227397+00	Contratación	gl-ES	2f829662-5031-4501-bfd3-b6e5d3f17224	asd	Contratación	2026-06-02 20:54:57.227397+00
ea8b6c64-0869-4d71-813b-a2cb04b903e9	2026-06-02 20:54:57.229898+00	Contratación	es-ES	2f829662-5031-4501-bfd3-b6e5d3f17224	asd	Contratación	2026-06-02 20:54:57.229898+00
636d6d10-73e3-402b-9b33-fddd3a8df2d0	2026-06-02 20:54:57.23752+00	Contratación	ca-ES	2f829662-5031-4501-bfd3-b6e5d3f17224	asd	Contratación	2026-06-02 20:54:57.23752+00
e08eb017-f3f9-49ad-8e9c-aed4b1906ffa	2026-06-02 20:54:57.244299+00	Contratación	eu-ES	2f829662-5031-4501-bfd3-b6e5d3f17224	asd	Contratación	2026-06-02 20:54:57.244299+00
fa428d60-343c-42e6-9743-0b8844980331	2026-06-02 20:54:57.248464+00	Contratación	va-ES	2f829662-5031-4501-bfd3-b6e5d3f17224	asd	Contratación	2026-06-02 20:54:57.248464+00
\.


ALTER TABLE public.procedure_type_i18n ENABLE TRIGGER ALL;

--
-- Data for Name: procedure_types; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.procedure_types DISABLE TRIGGER ALL;

COPY public.procedure_types (id, created_at, deadline_days, description, fee_amount, status, title, unit, updated_at, process_key, unit_code) FROM stdin;
a98135be-77fc-43f5-a6bf-e85ec5633ba5	2026-05-19 20:03:59.735414+00	30	Solicite una licencia para nueva actividad o negocio. Inicia el flujo BPM genérico de procedimiento ciudadano.	25.00	ACTIVE	Solicitud de Licencia	Unidad de Licencias	2026-05-19 20:03:59.735414+00	simpleCitizenProcedure	UNIDADDE
ebeba1d1-ec1b-4a75-a494-f2d485243e65	2026-05-19 20:04:00.01905+00	15	Solicite un certificado registral oficial. Inicia el flujo BPM genérico de procedimiento ciudadano.	10.00	ACTIVE	Certificado Registral	Oficina del Registro	2026-05-19 20:04:00.01905+00	simpleCitizenProcedure	OFICINAD
7cd934af-edb7-49c6-9f1f-303c7ffdf3f6	2026-05-19 20:04:00.268669+00	7	Actualice su domicilio registrado. Inicia el flujo BPM genérico de procedimiento ciudadano.	0.00	ACTIVE	Actualización de Domicilio	Servicios Ciudadanos	2026-05-19 20:04:00.268669+00	simpleCitizenProcedure	SERVICIO
58047cd7-a841-420b-b717-94e17d9d017a	2026-05-19 20:04:00.437044+00	45	Solicite una licencia municipal de obra. Inicia el flujo BPM genérico de procedimiento ciudadano.	120.00	ACTIVE	Licencia de Obra	Urbanismo	2026-05-19 20:04:00.437044+00	simpleCitizenProcedure	URBANISM
a0979ce0-21e1-4625-8da4-5cb8ab05c690	2026-05-19 20:04:00.58393+00	20	Denuncie incidentes recurrentes de ruido para inspección municipal. Inicia el flujo BPM genérico de procedimiento ciudadano.	0.00	ACTIVE	Denuncia por Ruidos	Unidad Medioambiental	2026-05-19 20:04:00.58393+00	simpleCitizenProcedure	UNIDADME
c67a82e3-fbae-465a-8237-569db71336f9	2026-05-19 20:04:00.709197+00	20	Solicite autorización para ocupar temporalmente espacio público. Inicia el flujo BPM genérico de procedimiento ciudadano.	35.00	ACTIVE	Autorización de Ocupación de Vía Pública	Oficina de Espacio Público	2026-05-19 20:04:00.709197+00	simpleCitizenProcedure	OFICINAD
5727b53e-163d-4722-b8cc-f6deafb63a5d	2026-05-19 20:04:00.834558+00	25	Presente una declaración para abrir una actividad comercial. Inicia el flujo BPM genérico de procedimiento ciudadano.	80.00	ACTIVE	Declaración de Apertura de Negocio	Desarrollo Económico	2026-05-19 20:04:00.834558+00	simpleCitizenProcedure	DESARROL
0b32b806-8d18-4aa9-baaa-b441e361a177	2026-05-19 20:04:00.960084+00	30	Solicite una bonificación fiscal municipal por circunstancias elegibles. Inicia el flujo BPM genérico de procedimiento ciudadano.	0.00	ACTIVE	Solicitud de Bonificación Fiscal	Oficina Tributaria	2026-05-19 20:04:00.960084+00	simpleCitizenProcedure	OFICINAT
0b7d866d-bcb0-4691-86b9-1d96f8325875	2026-05-19 20:04:01.086623+00	10	Registre un familiar en un domicilio municipal. Inicia el flujo BPM genérico de procedimiento ciudadano.	0.00	ACTIVE	Empadronamiento de Familiar	Registro de Población	2026-05-19 20:04:01.086623+00	simpleCitizenProcedure	REGISTRO
7698210e-88bf-4a61-8cca-4690ed0aefef	2026-05-19 20:04:01.199347+00	40	Solicite apoyo de ayuda social municipal. Inicia el flujo BPM genérico de procedimiento ciudadano.	0.00	ACTIVE	Solicitud de Ayuda Social	Servicios Sociales	2026-05-19 20:04:01.199347+00	simpleCitizenProcedure	SERVICIO
23ca7468-b830-4c8b-87f4-77534e5f7d1a	2026-05-19 20:04:01.299844+00	35	Solicite autorización para un evento cultural público. Inicia el flujo BPM genérico de procedimiento ciudadano.	60.00	ACTIVE	Autorización de Evento Cultural	Departamento de Cultura	2026-05-19 20:04:01.299844+00	simpleCitizenProcedure	DEPARTAM
02801fa1-3a58-4ca2-b2f9-b22308d8ec22	2026-05-19 20:04:01.405415+00	18	Solicite la poda de árboles en zonas públicas. Inicia el flujo BPM genérico de procedimiento ciudadano.	0.00	ACTIVE	Solicitud de Poda de Árboles	Parques y Jardines	2026-05-19 20:04:01.405415+00	simpleCitizenProcedure	PARQUESY
7fecfeac-761c-4549-ad36-e55d851cf0af	2026-05-22 12:07:59.048142+00	30	Procedimiento publicado para pruebas del flujo BPMN realista (documentacion, subsanacion, controles paralelos y decision final)	0.00	ACTIVE	Tramitacion avanzada con validaciones ENS/ENI	Unidad de Interoperabilidad	2026-06-02 20:46:13.4587+00	simpleCitizenProcedure	UNIDADDE
2f829662-5031-4501-bfd3-b6e5d3f17224	2026-06-02 20:54:56.911067+00	10		0.00	ACTIVE	asd	Contratación	2026-06-02 21:57:07.310634+00	simpleCitizenProcedure	CONTRATA
\.


ALTER TABLE public.procedure_types ENABLE TRIGGER ALL;

--
-- Data for Name: public_content_entries; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.public_content_entries DISABLE TRIGGER ALL;

COPY public.public_content_entries (id, body_text, category_code, created_at, download_url, entry_kind, event_date, external_url, locale, parent_group_id, published, related_procedure, sort_order, title_text, translation_group_id, updated_at, value_type) FROM stdin;
b70650fd-25d0-4174-bc2c-2006aa1f99ed	Normativa base de tramitacion electronica municipal.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565	es-ES	\N	t	\N	0	Marco de procedimiento administrativo	443ced34-2aee-4af4-ba93-de6b4e29c3ac	2026-05-19 20:04:01.532705+00	law
7b2571c6-840c-4908-8be1-327ee236fc6c	Normativa base de tramitació electrònica municipal.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565	ca-ES	\N	t	\N	0	Marc de procediment administratiu	443ced34-2aee-4af4-ba93-de6b4e29c3ac	2026-05-19 20:04:01.532705+00	law
9d53f3a8-f879-409f-9cd2-f1747ef3d4ad	Udal tramite elektronikoen oinarrizko araudia.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565	eu-ES	\N	t	\N	0	Prozedura administratiboaren esparrua	443ced34-2aee-4af4-ba93-de6b4e29c3ac	2026-05-19 20:04:01.532705+00	law
bb9ac0b2-4b0c-42d1-b2e7-6f0993f3b323	Normativa base de tramitación electrónica municipal.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565	gl-ES	\N	t	\N	0	Marco de procedemento administrativo	443ced34-2aee-4af4-ba93-de6b4e29c3ac	2026-05-19 20:04:01.532705+00	law
079e78dc-4bd7-440a-9c05-2ae996d1e4a0	Normativa base de tramitació electrònica municipal.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565	va-ES	\N	t	\N	0	Marc de procediment administratiu	443ced34-2aee-4af4-ba93-de6b4e29c3ac	2026-05-19 20:04:01.532705+00	law
ea268367-e54c-418e-b5bf-4f49a50ae603	Aplicacion del ENS en servicios digitales del ayuntamiento.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191	es-ES	\N	t	\N	1	Esquema Nacional de Seguridad	c39954f5-a0dd-46ce-bdb1-7b1f10941d44	2026-05-19 20:04:01.532705+00	decree
8cd1ea79-6b5e-41bf-89cf-e853ba085093	Aplicació de l'ENS en serveis digitals de l'ajuntament.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191	ca-ES	\N	t	\N	1	Esquema Nacional de Seguretat	c39954f5-a0dd-46ce-bdb1-7b1f10941d44	2026-05-19 20:04:01.532705+00	decree
2ee7f79f-ed9c-4940-a691-3f57e61c3570	ENS udal zerbitzu digitaletan aplikatzea.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191	eu-ES	\N	t	\N	1	Segurtasunaren Eskema Nazionala	c39954f5-a0dd-46ce-bdb1-7b1f10941d44	2026-05-19 20:04:01.532705+00	decree
20ce5c60-a50d-4f23-b7f2-d700140f5d8a	Aplicación do ENS en servizos dixitais do concello.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191	gl-ES	\N	t	\N	1	Esquema Nacional de Seguridade	c39954f5-a0dd-46ce-bdb1-7b1f10941d44	2026-05-19 20:04:01.532705+00	decree
746d3417-84a5-4c15-b438-2db78a7ee605	Aplicació de l'ENS en serveis digitals de l'ajuntament.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191	va-ES	\N	t	\N	1	Esquema Nacional de Seguretat	c39954f5-a0dd-46ce-bdb1-7b1f10941d44	2026-05-19 20:04:01.532705+00	decree
767212fa-479c-476c-be30-449b6c15e142	Criterios internos de archivo y conservacion documental.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	\N	es-ES	\N	t	\N	2	Orden de gestion documental	4e66c2e7-e0e5-4eba-91eb-44b690bf0563	2026-05-19 20:04:01.532705+00	order
eef79a14-7f26-4b04-8255-cf43635ab8db	Criteris interns d'arxiu i conservació documental.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	\N	ca-ES	\N	t	\N	2	Ordre de gestió documental	4e66c2e7-e0e5-4eba-91eb-44b690bf0563	2026-05-19 20:04:01.532705+00	order
4e184373-8e5c-4b35-a062-a98d5d6a248a	Artxibategi eta dokumentu kontserbazioaren irizpide internoak.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	\N	eu-ES	\N	t	\N	2	Kudeaketa dokumentalaren agindua	4e66c2e7-e0e5-4eba-91eb-44b690bf0563	2026-05-19 20:04:01.532705+00	order
b66bc5b5-263b-40ad-a47f-d5763ed6f24e	Criterios internos de arquivo e conservación documental.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	\N	gl-ES	\N	t	\N	2	Orde de xestión documental	4e66c2e7-e0e5-4eba-91eb-44b690bf0563	2026-05-19 20:04:01.532705+00	order
d6fe571d-6197-4c10-b39b-5ea0b24bca1f	Criteris interns d'arxiu i conservació documental.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	\N	va-ES	\N	t	\N	2	Ordre de gestió documental	4e66c2e7-e0e5-4eba-91eb-44b690bf0563	2026-05-19 20:04:01.532705+00	order
2ff66343-74a6-489c-a912-bd4bdbc5a0f1	Compromiso institucional con WCAG y mejora continua.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	\N	es-ES	\N	t	\N	3	Resolucion de accesibilidad	1a86fab1-27b4-4d69-8f28-c1bfb86e6702	2026-05-19 20:04:01.532705+00	resolution
f4b39e64-e6f9-4b97-a5a3-7111823adaf6	Compromís institucional amb WCAG i millora contínua.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	\N	ca-ES	\N	t	\N	3	Resolució d'accessibilitat	1a86fab1-27b4-4d69-8f28-c1bfb86e6702	2026-05-19 20:04:01.532705+00	resolution
0aaa5078-2c62-494f-a95d-fac42716972c	WCAG eta etengabeko hobekuntzarekin konpromiso instituzionala.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	\N	eu-ES	\N	t	\N	3	Irisgarritasunaren ebazpena	1a86fab1-27b4-4d69-8f28-c1bfb86e6702	2026-05-19 20:04:01.532705+00	resolution
6957e010-c05e-4616-a366-d7e1637667ad	Compromiso institucional con WCAG e mellora continua.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	\N	gl-ES	\N	t	\N	3	Resolució d'accessibilitat	1a86fab1-27b4-4d69-8f28-c1bfb86e6702	2026-05-19 20:04:01.532705+00	resolution
1b9de4e0-a7b8-4a10-861e-79fb865bdece	Compromís institucional amb WCAG i millora contínua.	\N	2026-05-19 20:04:01.532705+00	\N	LEGISLATION	\N	\N	va-ES	\N	t	\N	3	Resolució d'accessibilitat	1a86fab1-27b4-4d69-8f28-c1bfb86e6702	2026-05-19 20:04:01.532705+00	resolution
a7ff910b-82c1-4f3b-a56d-bf2e289d6b8f		general	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	es-ES	\N	t	\N	0	General	7ef129bc-957e-4849-b3fa-63d29f5ad912	2026-05-19 20:04:01.532705+00	\N
bfd8f3ed-5874-4512-9bb5-2ac35a464142		general	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	ca-ES	\N	t	\N	0	General	7ef129bc-957e-4849-b3fa-63d29f5ad912	2026-05-19 20:04:01.532705+00	\N
396b7cdd-5d1e-42e4-8f09-c3decd9ecab9		general	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	eu-ES	\N	t	\N	0	Orokorra	7ef129bc-957e-4849-b3fa-63d29f5ad912	2026-05-19 20:04:01.532705+00	\N
b2f435ce-e9d6-4f48-8bfb-073144621da0		general	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	gl-ES	\N	t	\N	0	Xeral	7ef129bc-957e-4849-b3fa-63d29f5ad912	2026-05-19 20:04:01.532705+00	\N
3e2dca39-ef99-4174-a0bc-19d4c843a90e		general	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	va-ES	\N	t	\N	0	General	7ef129bc-957e-4849-b3fa-63d29f5ad912	2026-05-19 20:04:01.532705+00	\N
96f45179-293a-47d5-b5d3-9c272b1b19f1		procedures	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	es-ES	\N	t	\N	1	Procedimientos	87fc41b6-2715-42e9-992a-cbb083fd23b0	2026-05-19 20:04:01.532705+00	\N
a7b86d6a-3b07-4640-8b45-7fb9ffc26ce8		procedures	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	ca-ES	\N	t	\N	1	Procediments	87fc41b6-2715-42e9-992a-cbb083fd23b0	2026-05-19 20:04:01.532705+00	\N
5664cdeb-a888-4633-afca-213f794b3f26		procedures	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	eu-ES	\N	t	\N	1	Prozedurak	87fc41b6-2715-42e9-992a-cbb083fd23b0	2026-05-19 20:04:01.532705+00	\N
8e7f4a23-d071-4449-af37-91738d774019		procedures	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	gl-ES	\N	t	\N	1	Procedementos	87fc41b6-2715-42e9-992a-cbb083fd23b0	2026-05-19 20:04:01.532705+00	\N
5cf037af-533f-4fea-a24e-ed40185242f1		procedures	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	va-ES	\N	t	\N	1	Procediments	87fc41b6-2715-42e9-992a-cbb083fd23b0	2026-05-19 20:04:01.532705+00	\N
98ba397b-80bf-4d8b-9cee-bf4b814ea42c		certificate	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	es-ES	\N	t	\N	2	Identidad digital	9a6facf7-3539-41c5-a64e-f017308b5a29	2026-05-19 20:04:01.532705+00	\N
db4948e8-5497-4f9b-bf8a-6a307f56d6ec		certificate	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	ca-ES	\N	t	\N	2	Identitat digital	9a6facf7-3539-41c5-a64e-f017308b5a29	2026-05-19 20:04:01.532705+00	\N
a1ac8944-0f80-425a-bc20-e9472964c785		certificate	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	eu-ES	\N	t	\N	2	Identitate digitala	9a6facf7-3539-41c5-a64e-f017308b5a29	2026-05-19 20:04:01.532705+00	\N
d6155df5-7497-472d-8473-bf11a3ffd30f		certificate	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	gl-ES	\N	t	\N	2	Identidade digital	9a6facf7-3539-41c5-a64e-f017308b5a29	2026-05-19 20:04:01.532705+00	\N
ab49843c-be19-491e-875a-d3b2d48b729f		certificate	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	va-ES	\N	t	\N	2	Identitat digital	9a6facf7-3539-41c5-a64e-f017308b5a29	2026-05-19 20:04:01.532705+00	\N
5229d026-34cd-434c-88ca-e962364193a0		payments	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	es-ES	\N	t	\N	3	Pagos	974ad61d-d3b5-4b23-b3ee-2333ec9fa438	2026-05-19 20:04:01.532705+00	\N
4783887a-c334-451e-9277-57b9f6baa004		payments	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	ca-ES	\N	t	\N	3	Pagaments	974ad61d-d3b5-4b23-b3ee-2333ec9fa438	2026-05-19 20:04:01.532705+00	\N
b8864a68-3285-4f94-a51a-6582e824c513		payments	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	eu-ES	\N	t	\N	3	Ordainketak	974ad61d-d3b5-4b23-b3ee-2333ec9fa438	2026-05-19 20:04:01.532705+00	\N
b4da767a-340e-40de-a720-cdf05a03f21e		payments	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	gl-ES	\N	t	\N	3	Pagos	974ad61d-d3b5-4b23-b3ee-2333ec9fa438	2026-05-19 20:04:01.532705+00	\N
3eb9119d-4cd3-49d9-a07b-607b00ea0b68		payments	2026-05-19 20:04:01.532705+00	\N	FAQ_CATEGORY	\N	\N	va-ES	\N	t	\N	3	Pagaments	974ad61d-d3b5-4b23-b3ee-2333ec9fa438	2026-05-19 20:04:01.532705+00	\N
be38ddae-c7dc-486b-bb1c-b9d5c126b688	Es el canal oficial para tramites, consultas y notificaciones digitales.	general	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	es-ES	\N	t	\N	0	Que es la sede electronica?	ee44786f-11fe-4b91-94f7-483aee81bd6e	2026-05-19 20:04:01.532705+00	\N
4c2a54a3-73e9-4ad1-974e-afcc7e8af045	És el canal oficial per a tràmits, consultes i notificacions digitals.	general	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	ca-ES	\N	t	\N	0	Que es la seu electrònica?	ee44786f-11fe-4b91-94f7-483aee81bd6e	2026-05-19 20:04:01.532705+00	\N
0d374afe-fc50-4226-acce-bcba1b174496	Tramite, kontsulta eta jakinarazpen digitalen kanal ofiziala da.	general	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	eu-ES	\N	t	\N	0	Zer da egoitza elektronikoa?	ee44786f-11fe-4b91-94f7-483aee81bd6e	2026-05-19 20:04:01.532705+00	\N
87f1de42-5f67-4d74-8e88-6ba5264c31f2	É o canal oficial para trámites, consultas e notificacións dixitais.	general	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	gl-ES	\N	t	\N	0	Que é a seu electrónica?	ee44786f-11fe-4b91-94f7-483aee81bd6e	2026-05-19 20:04:01.532705+00	\N
8bb95943-d5af-456b-ae20-ace0fc8ed83b	És el canal oficial per a tràmits, consultes i notificacions digitals.	general	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	va-ES	\N	t	\N	0	Que es la seu electrònica?	ee44786f-11fe-4b91-94f7-483aee81bd6e	2026-05-19 20:04:01.532705+00	\N
6d3db41e-9918-4254-ae5f-7d674768d99e	Seleccione el procedimiento y complete el formulario guiado por pasos.	procedures	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	es-ES	\N	t	\N	1	Como inicio un tramite?	aebe4d90-dea8-49a8-b621-2f29dd45f460	2026-05-19 20:04:01.532705+00	\N
cb8fa44d-7320-4768-918f-d3717af9255a	Seleccioneu el procediment i ompliu el formulari guiat per passos.	procedures	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	ca-ES	\N	t	\N	1	Com inicio un tràmit?	aebe4d90-dea8-49a8-b621-2f29dd45f460	2026-05-19 20:04:01.532705+00	\N
1ff4b27a-05d6-46bc-bfbc-0393b70fc018	Hautatu prozedura eta urratsez urratseko gidatutako inprimakia bete.	procedures	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	eu-ES	\N	t	\N	1	Nola hasi izapide bat?	aebe4d90-dea8-49a8-b621-2f29dd45f460	2026-05-19 20:04:01.532705+00	\N
45d4a416-e03b-439b-aab8-f8535fdde490	Seleccione o procedemento e complete o formulario guiado por pasos.	procedures	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	gl-ES	\N	t	\N	1	Como inicio un trámite?	aebe4d90-dea8-49a8-b621-2f29dd45f460	2026-05-19 20:04:01.532705+00	\N
a6424c79-2267-42f3-a6d2-566b9e1c17fe	Seleccioneu el procediment i ompliu el formulari guiat per passos.	procedures	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	va-ES	\N	t	\N	1	Com inicio un tràmit?	aebe4d90-dea8-49a8-b621-2f29dd45f460	2026-05-19 20:04:01.532705+00	\N
3377b25e-ad65-4abd-ba30-0a3bc6b1a1d8	Algunos tramites requieren certificado o sistema equivalente de identificacion.	certificate	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	es-ES	\N	t	\N	2	Necesito certificado digital?	1a24971b-02fb-4b6d-88b9-f2dee1ce8018	2026-05-19 20:04:01.532705+00	\N
494d8250-429e-4801-a81c-daec5335aa9a	Alguns tràmits requereixen certificat o sistema equivalent d'identificació.	certificate	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	ca-ES	\N	t	\N	2	Necessito certificat digital?	1a24971b-02fb-4b6d-88b9-f2dee1ce8018	2026-05-19 20:04:01.532705+00	\N
1f0ac741-7b3b-4fdc-8099-b35b017f5df8	Tramite batzuek ziurtagiria edo baliokideko identifikazio sistema behar dute.	certificate	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	eu-ES	\N	t	\N	2	Ziurtagiri digitala behar dut?	1a24971b-02fb-4b6d-88b9-f2dee1ce8018	2026-05-19 20:04:01.532705+00	\N
0405422d-6373-439a-a654-5ed2b4433f17	Algúns trámites requiren certificado ou sistema equivalente d'identificación.	certificate	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	gl-ES	\N	t	\N	2	Necesito certificado digital?	1a24971b-02fb-4b6d-88b9-f2dee1ce8018	2026-05-19 20:04:01.532705+00	\N
bfeca284-8d0a-4f40-972c-ce477f4ac868	Alguns tràmits requereixen certificat o sistema equivalent d'identificació.	certificate	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	va-ES	\N	t	\N	2	Necessito certificat digital?	1a24971b-02fb-4b6d-88b9-f2dee1ce8018	2026-05-19 20:04:01.532705+00	\N
87ebe36d-5941-4572-84b5-0e43ea41a68d	Al finalizar el pago puede descargar el recibo desde su expediente.	payments	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	es-ES	\N	t	\N	3	Como obtengo justificante de pago?	a3328bee-bd1e-436a-a655-4559685db3f4	2026-05-19 20:04:01.532705+00	\N
4c6647a1-e00d-4c80-8699-86a401f49302	En finalitzar el pagament podeu descarregar el rebut des del vostre expedient.	payments	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	ca-ES	\N	t	\N	3	Com obtinc justificant de pagament?	a3328bee-bd1e-436a-a655-4559685db3f4	2026-05-19 20:04:01.532705+00	\N
ad0b1eb8-4839-476a-984d-bd0bf72e99d6	Ordainketa amaitzean, agiria deskarga dezakezu zure espedientetik.	payments	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	eu-ES	\N	t	\N	3	Nola lortu ordainketa agiria?	a3328bee-bd1e-436a-a655-4559685db3f4	2026-05-19 20:04:01.532705+00	\N
ffeebba7-5c4e-4296-99fc-9199e87c7e18	Ao finalizar o pago pode descargar o recibo desde o seu expediente.	payments	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	gl-ES	\N	t	\N	3	Como obteño xustificante de pago?	a3328bee-bd1e-436a-a655-4559685db3f4	2026-05-19 20:04:01.532705+00	\N
ef9f34c8-d36e-4204-9f45-6aa9840857eb	En finalitzar el pagament podeu descarregar el rebut des del vostre expedient.	payments	2026-05-19 20:04:01.532705+00	\N	FAQ	\N	\N	va-ES	\N	t	\N	3	Com obtinc justificant de pagament?	a3328bee-bd1e-436a-a655-4559685db3f4	2026-05-19 20:04:01.532705+00	\N
c11a77ed-2e32-4eee-b88f-e07198a52157	Fecha limite para tramites con liquidacion de tasas.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-06-03	\N	es-ES	\N	t	tax-payment	0	Fin de plazo de tasas	643e29b6-4ecb-4738-b9a7-b3f4bdb1fb44	2026-05-19 20:04:01.532705+00	deadline
a514d752-2960-4acb-b950-8a7865c766de	Data límit per a tràmits amb liquidació de taxes.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-06-03	\N	ca-ES	\N	t	tax-payment	0	Fi de termini de taxes	643e29b6-4ecb-4738-b9a7-b3f4bdb1fb44	2026-05-19 20:04:01.532705+00	deadline
edf77a52-57d2-418a-a13c-b9baa1aaf69d	Tasen likidazioa duten tramiteentzako azken data.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-06-03	\N	eu-ES	\N	t	tax-payment	0	Tasen epe amaiera	643e29b6-4ecb-4738-b9a7-b3f4bdb1fb44	2026-05-19 20:04:01.532705+00	deadline
612c616d-9bdb-418a-8b89-b510ca3d1281	Data límite para trámites con liquidación de taxas.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-06-03	\N	gl-ES	\N	t	tax-payment	0	Fin de prazo de taxas	643e29b6-4ecb-4738-b9a7-b3f4bdb1fb44	2026-05-19 20:04:01.532705+00	deadline
5ba13bff-eb37-4a59-adf6-970f394af011	Data límit per a tràmits amb liquidació de taxes.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-06-03	\N	va-ES	\N	t	tax-payment	0	Fi de termini de taxes	643e29b6-4ecb-4738-b9a7-b3f4bdb1fb44	2026-05-19 20:04:01.532705+00	deadline
358efabb-aa49-4994-8ce7-187e0463bb2d	Dia no habil para atencion administrativa presencial.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-06-10	\N	es-ES	\N	t	\N	1	Festivo local	972c1483-bd80-4b3d-a569-e10eaf96540c	2026-05-19 20:04:01.532705+00	holiday
3cf234ba-4e43-4a00-aa39-5ae677fa882b	Dia no hàbil per a atenció administrativa presencial.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-06-10	\N	ca-ES	\N	t	\N	1	Festiu local	972c1483-bd80-4b3d-a569-e10eaf96540c	2026-05-19 20:04:01.532705+00	holiday
6e93f4f4-a059-49c6-954b-b6d88f727eba	Aurrez aurreko arreta administratiborako egun ez-habilitua.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-06-10	\N	eu-ES	\N	t	\N	1	Jai lokal	972c1483-bd80-4b3d-a569-e10eaf96540c	2026-05-19 20:04:01.532705+00	holiday
80accbc5-8d54-41ba-99d2-49151a7dd894	Día non hábil para atención administrativa presencial.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-06-10	\N	gl-ES	\N	t	\N	1	Festivo local	972c1483-bd80-4b3d-a569-e10eaf96540c	2026-05-19 20:04:01.532705+00	holiday
a73d3a3c-4752-4fc0-a2b5-d8af0ef586e7	Dia no hàbil per a atenció administrativa presencial.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-06-10	\N	va-ES	\N	t	\N	1	Festiu local	972c1483-bd80-4b3d-a569-e10eaf96540c	2026-05-19 20:04:01.532705+00	holiday
8e9f085e-8080-4329-8d10-da064d31bff3	Jornada abierta para resolver dudas sobre tramitacion.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-05-29	\N	es-ES	\N	t	\N	2	Sesion informativa digital	451ec7d1-54cc-41c2-9279-d908405798a3	2026-05-19 20:04:01.532705+00	info
f66ff9e7-7bcb-4d55-a1b0-15de1aa9553c	Jornada oberta per resoldre dubtes sobre tramitació.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-05-29	\N	ca-ES	\N	t	\N	2	Sessió informativa digital	451ec7d1-54cc-41c2-9279-d908405798a3	2026-05-19 20:04:01.532705+00	info
9d266eee-596a-4fd7-b1ae-526ee6f1e5d5	Tramitazioari buruzko zalantzak argitzeko jardunaldi irekia.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-05-29	\N	eu-ES	\N	t	\N	2	Saio informatibo digitala	451ec7d1-54cc-41c2-9279-d908405798a3	2026-05-19 20:04:01.532705+00	info
1a2e24fa-9efe-47e6-bdf8-1ee3d1ef695a	Xornada aberta para resolver dúbides sobre tramitación.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-05-29	\N	gl-ES	\N	t	\N	2	Sessió informativa digital	451ec7d1-54cc-41c2-9279-d908405798a3	2026-05-19 20:04:01.532705+00	info
1bb09f8d-9fc9-4264-9d52-3ec8baf3ac46	Jornada oberta per resoldre dubtes sobre tramitació.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-05-29	\N	va-ES	\N	t	\N	2	Sessió informativa digital	451ec7d1-54cc-41c2-9279-d908405798a3	2026-05-19 20:04:01.532705+00	info
1ba0bcf7-ddf8-45b3-8bbe-4d09c19c72ee	Revise expedientes en subsanacion para evitar caducidad.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-05-26	\N	es-ES	\N	t	\N	3	Recordatorio de subsanacion	ebe1007a-6fd0-4898-93fe-07044ebdf53b	2026-05-19 20:04:01.532705+00	reminder
2695c6f2-2563-40c4-8532-b65024a23e79	Reviseu expedients en esmena per evitar caducitat.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-05-26	\N	ca-ES	\N	t	\N	3	Recordatori d'esmena	ebe1007a-6fd0-4898-93fe-07044ebdf53b	2026-05-19 20:04:01.532705+00	reminder
d908ae87-1453-4cda-afc9-d8630445c496	Iraungipena saihesteko zuzenketa dauden espedienteak berrikusi.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-05-26	\N	eu-ES	\N	t	\N	3	Zuzenketa gogorarazlea	ebe1007a-6fd0-4898-93fe-07044ebdf53b	2026-05-19 20:04:01.532705+00	reminder
a0bb7145-7134-4cf2-b8fd-4aa063f3a702	Revise expedientes en subsanación para evitar caducidade.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-05-26	\N	gl-ES	\N	t	\N	3	Recordatorio de subsanación	ebe1007a-6fd0-4898-93fe-07044ebdf53b	2026-05-19 20:04:01.532705+00	reminder
b8a16795-cb6b-46ce-b824-93795623a3ec	Reviseu expedients en esmena per evitar caducitat.	\N	2026-05-19 20:04:01.532705+00	\N	CALENDAR	2026-05-26	\N	va-ES	\N	t	\N	3	Recordatori d'esmena	ebe1007a-6fd0-4898-93fe-07044ebdf53b	2026-05-19 20:04:01.532705+00	reminder
8fb841c2-01a2-4126-9fbd-864dc358e062	Garantizar una tramitacion digital segura, accesible y orientada al ciudadano.	mission	2026-05-19 20:04:01.532705+00	\N	INSTITUTIONAL	\N	\N	es-ES	\N	t	\N	0	Mision institucional	9a32a702-a546-4bba-8118-79ec8e55fbe6	2026-05-19 20:04:01.532705+00	target
4239bbcb-9b90-49fa-94d3-9755258d28a0	Garantir una tramitació digital segura, accessible i orientada al ciutadà.	mission	2026-05-19 20:04:01.532705+00	\N	INSTITUTIONAL	\N	\N	ca-ES	\N	t	\N	0	Missió institucional	9a32a702-a546-4bba-8118-79ec8e55fbe6	2026-05-19 20:04:01.532705+00	target
5416938d-7eb1-4317-a6ce-e247652abdde	Tramitazio digital seguru, irisgarri eta herritarrei zuzendua bermatzea.	mission	2026-05-19 20:04:01.532705+00	\N	INSTITUTIONAL	\N	\N	eu-ES	\N	t	\N	0	Misio instituzionala	9a32a702-a546-4bba-8118-79ec8e55fbe6	2026-05-19 20:04:01.532705+00	target
eded855c-4ee5-466e-871c-335f23104e9c	Garantizar unha tramitación digital segura, accesible e orientada ao cidadán.	mission	2026-05-19 20:04:01.532705+00	\N	INSTITUTIONAL	\N	\N	gl-ES	\N	t	\N	0	Missió institucional	9a32a702-a546-4bba-8118-79ec8e55fbe6	2026-05-19 20:04:01.532705+00	target
603c4f43-d59b-4ef5-9408-a4815a932d33	Garantir una tramitació digital segura, accessible i orientada al ciutadà.	mission	2026-05-19 20:04:01.532705+00	\N	INSTITUTIONAL	\N	\N	va-ES	\N	t	\N	0	Missió institucional	9a32a702-a546-4bba-8118-79ec8e55fbe6	2026-05-19 20:04:01.532705+00	target
2337b5ec-7334-482c-a6fe-dd1b33f0cf78	Unidades de atencion, tramitacion y soporte coordinadas por sede electronica.	structure	2026-05-19 20:04:01.532705+00	\N	INSTITUTIONAL	\N	\N	es-ES	\N	t	\N	1	Estructura organizativa	284fc38b-f286-4036-97e2-b037e0666dd8	2026-05-19 20:04:01.532705+00	building
f4032602-62e2-4381-bbba-f033747a834e	Unitats d'atenció, tramitació i suport coordinades per seu electrònica.	structure	2026-05-19 20:04:01.532705+00	\N	INSTITUTIONAL	\N	\N	ca-ES	\N	t	\N	1	Estructura organitzativa	284fc38b-f286-4036-97e2-b037e0666dd8	2026-05-19 20:04:01.532705+00	building
707f84fd-8aed-413f-aaaa-dd239b76bab3	Arreta, tramite eta laguntza unitateak egoitza elektronikoak koordinatuak.	structure	2026-05-19 20:04:01.532705+00	\N	INSTITUTIONAL	\N	\N	eu-ES	\N	t	\N	1	Antolaketa egitura	284fc38b-f286-4036-97e2-b037e0666dd8	2026-05-19 20:04:01.532705+00	building
6908750b-e019-4399-9f09-e52dfa0d48d3	Unidades de atención, tramitación e soporte coordinadas por seu electrónica.	structure	2026-05-19 20:04:01.532705+00	\N	INSTITUTIONAL	\N	\N	gl-ES	\N	t	\N	1	Estructura organizativa	284fc38b-f286-4036-97e2-b037e0666dd8	2026-05-19 20:04:01.532705+00	building
d549f9fb-a9d5-4dfc-b545-3f482f8da882	Unitats d'atenció, tramitació i suport coordinades per seu electrònica.	structure	2026-05-19 20:04:01.532705+00	\N	INSTITUTIONAL	\N	\N	va-ES	\N	t	\N	1	Estructura organitzativa	284fc38b-f286-4036-97e2-b037e0666dd8	2026-05-19 20:04:01.532705+00	building
885f1b8a-d0f0-4732-b5e9-152f63eefdd9	Gestion de licencias urbanisticas y disciplina territorial.	planning	2026-05-19 20:04:01.532705+00	urbanismo@ayto.example.org	ORGANISM	\N	https://sede.example.org/urbanismo	es-ES	\N	t	900100100	0	Urbanismo	4d853f68-39c9-4639-a7e6-5b1cbc9ca08a	2026-05-19 20:04:01.532705+00	Plaza Mayor 1
48ebd979-d849-446b-9bf9-0bd4283b67d8	Gestió de llicències urbanístiques i disciplina territorial.	planning	2026-05-19 20:04:01.532705+00	urbanismo@ayto.example.org	ORGANISM	\N	https://sede.example.org/urbanismo	ca-ES	\N	t	900100100	0	Urbanisme	4d853f68-39c9-4639-a7e6-5b1cbc9ca08a	2026-05-19 20:04:01.532705+00	Plaça Major 1
a8b9708c-782f-4f07-a907-118c4416328f	Lizentzia urbanistikoak eta lurralde diziplina kudeaketa.	planning	2026-05-19 20:04:01.532705+00	urbanismo@ayto.example.org	ORGANISM	\N	https://sede.example.org/urbanismo	eu-ES	\N	t	900100100	0	Hirigintza	4d853f68-39c9-4639-a7e6-5b1cbc9ca08a	2026-05-19 20:04:01.532705+00	Plaza Nagusia 1
504ef415-378b-4bc1-9f50-17ade19781cb	Xestión de llicències urbanístiques i disciplina territorial.	planning	2026-05-19 20:04:01.532705+00	urbanismo@ayto.example.org	ORGANISM	\N	https://sede.example.org/urbanismo	gl-ES	\N	t	900100100	0	Urbanismo	4d853f68-39c9-4639-a7e6-5b1cbc9ca08a	2026-05-19 20:04:01.532705+00	Praza Maior 1
712c6129-6def-49b2-942b-77a4f9512820	Gestió de llicències urbanístiques i disciplina territorial.	planning	2026-05-19 20:04:01.532705+00	urbanismo@ayto.example.org	ORGANISM	\N	https://sede.example.org/urbanismo	va-ES	\N	t	900100100	0	Urbanisme	4d853f68-39c9-4639-a7e6-5b1cbc9ca08a	2026-05-19 20:04:01.532705+00	Plaça Major 1
f8ee65ae-e2df-4730-a18d-0854e44a182f	Atencion al ciudadano para tramites de registro y certificaciones.	citizen	2026-05-19 20:04:01.532705+00	registro@ayto.example.org	ORGANISM	\N	https://sede.example.org/registro	es-ES	\N	t	900100200	1	Registro General	a145a909-2622-4737-8aa6-93160d22aad8	2026-05-19 20:04:01.532705+00	Avenida Centro 12
b70a3e39-98df-49eb-91cd-9789fcf76fde	Atenció al ciutadà per a tràmits de registre i certificacions.	citizen	2026-05-19 20:04:01.532705+00	registro@ayto.example.org	ORGANISM	\N	https://sede.example.org/registro	ca-ES	\N	t	900100200	1	Registre General	a145a909-2622-4737-8aa6-93160d22aad8	2026-05-19 20:04:01.532705+00	Avinguda Centre 12
45016f64-1549-4000-af6d-b04760fdc2a4	Herritarren arreta erregistro eta ziurtagirien tramiteetarako.	citizen	2026-05-19 20:04:01.532705+00	registro@ayto.example.org	ORGANISM	\N	https://sede.example.org/registro	eu-ES	\N	t	900100200	1	Erregistro Nagusia	a145a909-2622-4737-8aa6-93160d22aad8	2026-05-19 20:04:01.532705+00	Erdigune Etorbidea 12
ddce9816-d295-4750-97cd-6a00113b18c8	Atención al ciudadano para trámites de registro y certificaciones.	citizen	2026-05-19 20:04:01.532705+00	registro@ayto.example.org	ORGANISM	\N	https://sede.example.org/registro	gl-ES	\N	t	900100200	1	Rexistro Xeral	a145a909-2622-4737-8aa6-93160d22aad8	2026-05-19 20:04:01.532705+00	Avinguda Centre 12
86d9646f-de17-4071-8e8a-f3a4e37bb910	Atenció al ciutadà per a tràmits de registre i certificacions.	citizen	2026-05-19 20:04:01.532705+00	registro@ayto.example.org	ORGANISM	\N	https://sede.example.org/registro	va-ES	\N	t	900100200	1	Registre General	a145a909-2622-4737-8aa6-93160d22aad8	2026-05-19 20:04:01.532705+00	Avinguda Centre 12
ea298d54-c216-44f1-b9ab-fcd79f791123	Mecanismo de identificacion electronica para firma y autenticacion.	\N	2026-05-19 20:04:01.532705+00	\N	RESOURCE	\N	\N	es-ES	\N	t	FNMT, Cl@ve	0	Certificado digital	278a573b-2ced-4add-a0ef-4717f0d2223c	2026-05-19 20:04:01.532705+00	glossary
e7374a93-61cb-41be-b0b2-e4c0d8542832	Mecanisme d'identificació electrònica per a signatura i autenticació.	\N	2026-05-19 20:04:01.532705+00	\N	RESOURCE	\N	\N	ca-ES	\N	t	FNMT, Cl@ve	0	Certificat digital	278a573b-2ced-4add-a0ef-4717f0d2223c	2026-05-19 20:04:01.532705+00	glossary
f675eef0-ad9b-4802-854c-a78fcac91117	Sinadura eta autentifikaziorako identifikazio elektroniko mekanismoa.	\N	2026-05-19 20:04:01.532705+00	\N	RESOURCE	\N	\N	eu-ES	\N	t	FNMT, Cl@ve	0	Ziurtagiri digitala	278a573b-2ced-4add-a0ef-4717f0d2223c	2026-05-19 20:04:01.532705+00	glossary
2cff68c5-6ac2-4d0a-81eb-758c491a7364	Mecanismo d'identificación electrònica para firma i autenticación.	\N	2026-05-19 20:04:01.532705+00	\N	RESOURCE	\N	\N	gl-ES	\N	t	FNMT, Cl@ve	0	Certificado digital	278a573b-2ced-4add-a0ef-4717f0d2223c	2026-05-19 20:04:01.532705+00	glossary
0eba33a0-f849-48a0-9959-41479f194a6b	Mecanisme d'identificació electrònica per a signatura i autenticació.	\N	2026-05-19 20:04:01.532705+00	\N	RESOURCE	\N	\N	va-ES	\N	t	FNMT, Cl@ve	0	Certificat digital	278a573b-2ced-4add-a0ef-4717f0d2223c	2026-05-19 20:04:01.532705+00	glossary
67da7455-9568-4f09-9c2c-9bf649d6cb38	Conjunto de documentos y actuaciones asociadas a un procedimiento.	\N	2026-05-19 20:04:01.532705+00	\N	RESOURCE	\N	\N	es-ES	\N	t	Procedimiento, Tramite	1	Expediente	d1a626cc-703d-4cb6-8dd2-f1ccfc0944f6	2026-05-19 20:04:01.532705+00	glossary
ac396373-5bd5-4016-9025-19410ce8f83f	Conjunt de documents i actuacions associades a un procediment.	\N	2026-05-19 20:04:01.532705+00	\N	RESOURCE	\N	\N	ca-ES	\N	t	Procedimiento, Tramite	1	Expedient	d1a626cc-703d-4cb6-8dd2-f1ccfc0944f6	2026-05-19 20:04:01.532705+00	glossary
8599f31a-e104-42b2-9dea-4d0f0356b0c1	Prozedura bati lotutako dokumentu eta ekintzen multzoa.	\N	2026-05-19 20:04:01.532705+00	\N	RESOURCE	\N	\N	eu-ES	\N	t	Procedimiento, Tramite	1	Espedientea	d1a626cc-703d-4cb6-8dd2-f1ccfc0944f6	2026-05-19 20:04:01.532705+00	glossary
3723cd82-92f4-4909-ac5b-707118e9ac60	Conxunto de documentos i actuacions associades a un procediment.	\N	2026-05-19 20:04:01.532705+00	\N	RESOURCE	\N	\N	gl-ES	\N	t	Procedimiento, Tramite	1	Expediente	d1a626cc-703d-4cb6-8dd2-f1ccfc0944f6	2026-05-19 20:04:01.532705+00	glossary
a3567c86-77a4-46cf-8607-68d47e424554	Conjunt de documents i actuacions associades a un procediment.	\N	2026-05-19 20:04:01.532705+00	\N	RESOURCE	\N	\N	va-ES	\N	t	Procedimiento, Tramite	1	Expedient	d1a626cc-703d-4cb6-8dd2-f1ccfc0944f6	2026-05-19 20:04:01.532705+00	glossary
38b38842-ea4e-4127-b1c3-2b1e90ee722b		institucional-azul	2026-06-22 14:09:51.671714+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	0	#2563eb	822fe0c3-d177-4925-8d1e-110987444731	2026-06-22 14:09:51.671714+00	--sede-color-primary
e0d5b64e-5358-42d7-a991-f7064568fd03		institucional-azul	2026-06-22 14:09:51.677587+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	1	#1d4ed8	50e09f42-aea4-4365-83ac-a5adcac857fb	2026-06-22 14:09:51.677587+00	--sede-color-primary-hover
ffabdf5f-69cd-4e32-9f36-f6561ea46d32		institucional-azul	2026-06-22 14:09:51.67966+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	2	#eff6ff	0de55d2a-70b2-4a18-898e-a550e6bd4685	2026-06-22 14:09:51.67966+00	--sede-color-primary-50
75147f36-24ab-4944-a343-66e78606a2a7		institucional-azul	2026-06-22 14:09:51.681372+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	3	#ffffff	259948ab-25ac-4fc8-8794-1d4b8c67c191	2026-06-22 14:09:51.681372+00	--sede-color-primary-contrast
ad6cc9b5-06f0-404c-8742-04a63d9c4d09		institucional-azul	2026-06-22 14:09:51.682661+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	4	#0ea5e9	c81503b8-bd22-460c-b4a3-f7e695ef106e	2026-06-22 14:09:51.682661+00	--sede-color-link
0238832f-4005-4d41-b804-f94c695254a4		institucional-azul	2026-06-22 14:09:51.683769+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	5	#f8fafc	17035fd9-6b20-400b-aa57-084b96c28003	2026-06-22 14:09:51.683769+00	--sede-color-bg
f91de274-e6b6-4657-8761-d1979b23d075		institucional-azul	2026-06-22 14:09:51.684636+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	6	#ffffff	deaba7b5-e930-4d2f-8f88-8a7a967660cb	2026-06-22 14:09:51.684636+00	--sede-color-surface
2f63caa2-80d1-484b-bfdc-67eac5f45635		institucional-azul	2026-06-22 14:09:51.685377+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	7	#0f172a	9b2332ed-26dd-47b7-a019-79ecd63debf6	2026-06-22 14:09:51.685377+00	--sede-color-text
dfcd1118-c672-4d9c-a48e-cd49d9ba9003		institucional-azul	2026-06-22 14:09:51.686098+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	8	#475569	d611c8b0-e4a4-4c97-b86c-0f15a988adc0	2026-06-22 14:09:51.686098+00	--sede-color-muted
950ca54b-ef98-4307-a9d2-57d816162a4d		institucional-azul	2026-06-22 14:09:51.686783+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	9	#e2e8f0	63684374-b419-4d31-bc85-b7d7244b9df9	2026-06-22 14:09:51.686783+00	--sede-color-border
ab0b0027-16d8-4a74-ace8-7eb67063fc50		institucional-azul	2026-06-22 14:09:51.688119+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	10	#0e2a47	d4086904-c680-422e-a434-294d3233d37c	2026-06-22 14:09:51.688119+00	--sede-color-hero-bg
c7f06dc7-2d85-4577-bc9d-a602669a3415		institucional-azul	2026-06-22 14:09:51.689845+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	11	#f8fafc	6f1c1c72-0c17-49d4-92d8-0e6a0445f360	2026-06-22 14:09:51.689845+00	--sede-color-hero-text
54ee68ac-9008-4b08-b366-348cb29e9bde		institucional-azul	2026-06-22 14:09:51.690945+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	12	#d9e2ec	d84cdeb8-d008-4b8f-a04c-d25848349487	2026-06-22 14:09:51.690945+00	--sede-color-hero-subtitle
6064661b-c9cc-4fd5-ac0a-3c6f5b4fb2a1		institucional-azul	2026-06-22 14:09:51.692091+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	13	rgba(14, 116, 144, 0.10)	59421cfb-5dfd-4874-ad03-225a36a8034b	2026-06-22 14:09:51.692091+00	--sede-color-calendar-date-bg
4ca1a9d9-7b25-47e6-a9d8-786c2d42bcea		institucional-azul	2026-06-22 14:09:51.693174+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	14	#0ea5e9	485b11b8-717a-450c-ab86-c5126b31989f	2026-06-22 14:09:51.693174+00	--sede-color-calendar-date-text
3cbc1f57-bbcc-4c37-9260-5abf45d13633		institucional-azul	2026-06-22 14:09:51.694099+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	15	#0f172a	bedde43d-d6ea-4117-a786-5109cfbdb36d	2026-06-22 14:09:51.694099+00	--sede-color-footer-bg
ad3a3592-66dd-4573-b2cf-7c1d32d7ce79		institucional-azul	2026-06-22 14:09:51.694872+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	16	#cbd5e1	c5f19803-7cff-4610-9290-353d48957cf3	2026-06-22 14:09:51.694872+00	--sede-color-footer-text
c2004de2-edd5-48a5-9ceb-4e31f6404116		institucional-azul	2026-06-22 14:09:51.695922+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	17	#3b82f6	86fd4a85-1fc0-4995-b7e8-6345d9cf16b9	2026-06-22 14:09:51.695922+00	--sede-color-primary
b9111535-333c-4717-a5ad-96af2da8c32c		institucional-azul	2026-06-22 14:09:51.697491+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	18	#60a5fa	edba486f-e45b-4abe-b423-7a39489644c1	2026-06-22 14:09:51.697491+00	--sede-color-primary-hover
54444ed8-0d05-40c2-a361-c4976ce27d5d		institucional-azul	2026-06-22 14:09:51.699581+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	19	#1e3a5f	05c4c4ef-d136-403e-84dd-4eaffdb01032	2026-06-22 14:09:51.699581+00	--sede-color-primary-50
c89092be-ed4a-47d0-8460-ae6d7c908d62		institucional-azul	2026-06-22 14:09:51.701833+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	20	#ffffff	cc0d3b1b-733b-441a-8303-53cb09807e49	2026-06-22 14:09:51.701833+00	--sede-color-primary-contrast
609653f7-6515-42d7-b602-f269eadd963a		institucional-azul	2026-06-22 14:09:51.704445+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	21	#38bdf8	8830da04-5bf8-4a83-98ac-e83348b1aacb	2026-06-22 14:09:51.704445+00	--sede-color-link
12fb9cde-bbe1-488e-85c6-850b1237c37e		institucional-azul	2026-06-22 14:09:51.705373+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	22	#0f172a	bd3b23dc-995c-42ff-b980-e5f65c56cfa5	2026-06-22 14:09:51.705373+00	--sede-color-bg
9a5cb44c-5c59-4aff-b17f-d90905379452		institucional-azul	2026-06-22 14:09:51.706122+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	23	#1e293b	43e243f2-714a-47ab-926a-534c9ef75648	2026-06-22 14:09:51.706122+00	--sede-color-surface
e8e72bc2-7fa2-4f42-92d2-191dfc73cce3		institucional-azul	2026-06-22 14:09:51.706807+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	24	#f1f5f9	4bc25334-0604-41ed-88b9-76b8906313a7	2026-06-22 14:09:51.706807+00	--sede-color-text
0e079d83-1ef9-4d0d-afd8-394ad223eea6		institucional-azul	2026-06-22 14:09:51.707635+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	25	#94a3b8	2d47c918-3eaa-467f-904f-4a718bc5a08d	2026-06-22 14:09:51.707635+00	--sede-color-muted
247bd394-9c79-4f62-8e24-753772654531		institucional-azul	2026-06-22 14:09:51.708905+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	26	#334155	c80d1679-f0d9-41b7-acb4-6dd19052b273	2026-06-22 14:09:51.708905+00	--sede-color-border
5c5ef5ce-46bc-4cfa-a2a5-e2ca8d561f83		institucional-azul	2026-06-22 14:09:51.710295+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	27	#0c1929	0ac4ef3c-36b3-4db6-b0ee-33755db52752	2026-06-22 14:09:51.710295+00	--sede-color-hero-bg
db713e4a-71b6-4473-ab87-50eba82d751d		institucional-azul	2026-06-22 14:09:51.711558+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	28	#f8fafc	03aa8765-9401-4380-859b-6288db4e42ac	2026-06-22 14:09:51.711558+00	--sede-color-hero-text
671f33d2-8f09-4af3-95a1-49f401daeece		institucional-azul	2026-06-22 14:09:51.713532+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	29	#94a3b8	0b4108b8-f70d-4c96-8ee8-f7fda4c25ece	2026-06-22 14:09:51.713532+00	--sede-color-hero-subtitle
be604167-5b8d-4156-8556-9f455d5cd2f9		institucional-azul	2026-06-22 14:09:51.716176+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	30	rgba(59, 130, 246, 0.15)	67e8d6e9-ea62-4dbb-a8f5-1038c5a1bc9c	2026-06-22 14:09:51.716176+00	--sede-color-calendar-date-bg
5a9a9eab-4430-4b25-98ab-d5f2c77a35ed		institucional-azul	2026-06-22 14:09:51.717256+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	31	#60a5fa	c3d83852-4d0e-47cb-99a4-f2d4cc5062ff	2026-06-22 14:09:51.717256+00	--sede-color-calendar-date-text
29d2220f-042f-48b3-ba3d-a35d844913d6		institucional-azul	2026-06-22 14:09:51.718114+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	32	#020617	9e17f6cd-4d80-4dcf-baa0-99617bc77890	2026-06-22 14:09:51.718114+00	--sede-color-footer-bg
cbbe824d-091c-45e4-9c99-5f7917503541		institucional-azul	2026-06-22 14:09:51.718946+00	\N	THEME	\N	\N	light-ES	\N	t	Institucional Azul	33	#64748b	1b500f4e-ef8b-49fd-b9f5-69108d547266	2026-06-22 14:09:51.718946+00	--sede-color-footer-text
7511a2c5-f172-42e9-8e8a-7f69015d351d		verde-administrativo	2026-06-22 14:09:51.71981+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1000	#0f766e	6b307868-f5dd-46c9-be9d-f96c9d316811	2026-06-22 14:09:51.71981+00	--sede-color-primary
99819750-d238-46df-a472-fbd27c4fee1c		verde-administrativo	2026-06-22 14:09:51.720722+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1001	#115e59	cbf87935-b440-4788-b5d0-52c1a221620f	2026-06-22 14:09:51.720722+00	--sede-color-primary-hover
c4fdfac9-4dd8-46ed-93ee-debd1604f0f1		verde-administrativo	2026-06-22 14:09:51.721487+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1002	#f0fdfa	0a9ba039-7562-4b0e-a1c5-b36e707fdf03	2026-06-22 14:09:51.721487+00	--sede-color-primary-50
89a9d23e-f42e-43fa-a914-89e9e205da17		verde-administrativo	2026-06-22 14:09:51.722107+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1003	#ffffff	9d11b31d-9ed7-47e3-848e-3b390e04bb22	2026-06-22 14:09:51.722107+00	--sede-color-primary-contrast
15527338-f1d6-4a08-b2e7-ca7538cbcb05		verde-administrativo	2026-06-22 14:09:51.722715+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1004	#0d9488	757f0042-ff96-4e4c-bfe7-eb9e4f2f3b2b	2026-06-22 14:09:51.722715+00	--sede-color-link
3aa7f0d0-4efc-4f67-961b-66e3c65a011f		verde-administrativo	2026-06-22 14:09:51.723359+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1005	#f5fffa	41533f67-7adf-4419-8906-21ba4eb959dc	2026-06-22 14:09:51.723359+00	--sede-color-bg
64a8b535-8e06-4897-bf98-f8fccb0a2fe0		verde-administrativo	2026-06-22 14:09:51.725416+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1006	#ffffff	9e5ce1e3-cd43-4ce8-af89-11064f6ca998	2026-06-22 14:09:51.725416+00	--sede-color-surface
86152897-a942-4548-85e7-4487092f883c		verde-administrativo	2026-06-22 14:09:51.727755+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1007	#0f172a	4d1f4755-4847-4016-aca3-11dd0e763a55	2026-06-22 14:09:51.727755+00	--sede-color-text
f8e8b119-7acb-4618-a590-8a707d399ef5		verde-administrativo	2026-06-22 14:09:51.728952+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1008	#4b5563	1a717d55-dc4f-4fb2-9123-d3f6b7fa4a5c	2026-06-22 14:09:51.728952+00	--sede-color-muted
627c18c4-0f91-4d15-b69b-135d6d98c5f0		verde-administrativo	2026-06-22 14:09:51.730048+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1009	#e2e8f0	1475579e-1ff2-49b6-a32e-0a090a89b75d	2026-06-22 14:09:51.730048+00	--sede-color-border
b21a3cf0-2b67-4984-995c-33507cfc38ce		verde-administrativo	2026-06-22 14:09:51.730939+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1010	#064e3b	25f8e48d-4cf5-4e28-b49d-6eb0f9573f78	2026-06-22 14:09:51.730939+00	--sede-color-hero-bg
d02b6345-2593-4645-b997-82e0ed2cb377		verde-administrativo	2026-06-22 14:09:51.731814+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1011	#f0fdf4	73a50cbf-50bd-41ab-8f65-90bc3c3f8604	2026-06-22 14:09:51.731814+00	--sede-color-hero-text
72c38e5c-e47d-4b66-9cc0-0b583b102d89		verde-administrativo	2026-06-22 14:09:51.732716+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1012	#bbf7d0	c641c91e-ba8b-45df-926e-75f876b547bf	2026-06-22 14:09:51.732716+00	--sede-color-hero-subtitle
de586442-ff15-4e4d-af61-b80cfb9b5a71		verde-administrativo	2026-06-22 14:09:51.73359+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1013	rgba(15, 118, 110, 0.10)	7bcb26c0-b59b-4ce0-8c67-37d1613ad956	2026-06-22 14:09:51.73359+00	--sede-color-calendar-date-bg
c1b5e6c1-fd0a-4810-a029-79bbddbe6e8f		verde-administrativo	2026-06-22 14:09:51.734388+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1014	#0d9488	8440171e-a63c-47e1-9d19-bcf3d09915a7	2026-06-22 14:09:51.734388+00	--sede-color-calendar-date-text
e3e3fd68-b57a-4fe5-bda3-f22eeff62fb1		verde-administrativo	2026-06-22 14:09:51.735122+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1015	#064e3b	c083da3f-cc62-411f-ac0c-8ad5a3be9ab4	2026-06-22 14:09:51.735122+00	--sede-color-footer-bg
874ae11d-4620-448d-ac6a-290d815a661d		verde-administrativo	2026-06-22 14:09:51.736358+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1016	#a7f3d0	4b94d54f-4b96-4e8f-b4eb-4f9c3c2cfe80	2026-06-22 14:09:51.736358+00	--sede-color-footer-text
20d15a6e-8d2f-4c3c-bf49-4a1a2a247f25		verde-administrativo	2026-06-22 14:09:51.737939+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1017	#2dd4bf	a7b89e1f-d5e5-433b-b9a3-d20eb400f8b9	2026-06-22 14:09:51.737939+00	--sede-color-primary
77fbde08-ec61-4d2b-8d55-4f9a40ffe456		verde-administrativo	2026-06-22 14:09:51.73938+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1018	#5eead4	d1f80095-e067-4513-99f7-2ab7d2a64bbe	2026-06-22 14:09:51.73938+00	--sede-color-primary-hover
c0c5a8bb-ec46-42f2-97fe-2357d79ba917		verde-administrativo	2026-06-22 14:09:51.740138+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1019	#134e4a	0cabfbc0-9856-4b80-9b9e-75d278888126	2026-06-22 14:09:51.740138+00	--sede-color-primary-50
b657048d-280c-441b-b04b-fa2f8c4fffb6		verde-administrativo	2026-06-22 14:09:51.740882+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1020	#042f2e	799f966c-5ed8-46f8-a631-fc734777aa03	2026-06-22 14:09:51.740882+00	--sede-color-primary-contrast
25b84545-2d56-40ac-a714-a5b02adbabae		verde-administrativo	2026-06-22 14:09:51.743492+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1021	#2dd4bf	0cd6faca-4ec9-46cd-8864-24dc4fd8bbf1	2026-06-22 14:09:51.743492+00	--sede-color-link
39d7b0a3-1f75-4f82-a179-67e1adb78eaf		verde-administrativo	2026-06-22 14:09:51.744623+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1022	#042f2e	79367972-5fb3-4e7c-acde-824e3cafa1f1	2026-06-22 14:09:51.744623+00	--sede-color-bg
d7440dbc-6cb5-49ee-ab3b-22ea9c3123ef		verde-administrativo	2026-06-22 14:09:51.745475+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1023	#134e4a	cc7b75c0-1d67-40cf-a7ac-ab2682fe25bb	2026-06-22 14:09:51.745475+00	--sede-color-surface
123b290d-445f-4325-85ab-6be5b4080022		verde-administrativo	2026-06-22 14:09:51.746143+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1024	#f0fdfa	c37af0cc-cc9a-4a7a-ad04-3c1ee5d37148	2026-06-22 14:09:51.746143+00	--sede-color-text
c24107dd-73fe-4f7d-adda-a9e3f04a4722		verde-administrativo	2026-06-22 14:09:51.747159+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1025	#5eead4	e6e8f067-b2a7-4e5b-b5aa-e1ce81b36ee6	2026-06-22 14:09:51.747159+00	--sede-color-muted
0d6ec1b6-3c02-4b22-86fc-b38094bbe88a		verde-administrativo	2026-06-22 14:09:51.74887+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1026	#1a5c56	1261a821-208f-4305-8afb-0e17bdf88fad	2026-06-22 14:09:51.74887+00	--sede-color-border
8e8c834a-82ea-447f-b0a7-5720f3f517f4		verde-administrativo	2026-06-22 14:09:51.750969+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1027	#022c22	b4584a95-180f-47b2-8ce3-d55181ccbff4	2026-06-22 14:09:51.750969+00	--sede-color-hero-bg
5997e5d4-33bf-4791-9208-d546ffa4cdd2		verde-administrativo	2026-06-22 14:09:51.753453+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1028	#f0fdf4	b9b11a28-b9c2-4a3a-9d0c-275fdabc5996	2026-06-22 14:09:51.753453+00	--sede-color-hero-text
3696535e-2305-4522-8e71-69d2deec75bc		verde-administrativo	2026-06-22 14:09:51.755382+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1029	#5eead4	d308b425-7eb1-4617-837f-886af0d8f186	2026-06-22 14:09:51.755382+00	--sede-color-hero-subtitle
1c4b6ddd-f847-4f1b-b646-3a919f63019b		verde-administrativo	2026-06-22 14:09:51.757338+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1030	rgba(45, 212, 191, 0.15)	df64d199-3092-4e5c-b33d-6e8b37239a79	2026-06-22 14:09:51.757338+00	--sede-color-calendar-date-bg
a504380f-bb0f-4818-a23a-21ce23bd9e78		verde-administrativo	2026-06-22 14:09:51.758285+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1031	#2dd4bf	b88f9906-0ec3-4c3c-9846-74390692a7a5	2026-06-22 14:09:51.758285+00	--sede-color-calendar-date-text
1a9f6f81-2e7c-48cc-bacf-703cfa09d01c		verde-administrativo	2026-06-22 14:09:51.759375+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1032	#022c22	9a464698-9a5f-499f-97b5-02c2f190fdc1	2026-06-22 14:09:51.759375+00	--sede-color-footer-bg
c46055b0-9e3f-483b-a51d-cec99334fc31		verde-administrativo	2026-06-22 14:09:51.76037+00	\N	THEME	\N	\N	light-ES	\N	f	Verde Administrativo	1033	#5eead4	378db09c-f109-4da4-b187-4c0e1b6336de	2026-06-22 14:09:51.76037+00	--sede-color-footer-text
8048bef4-0791-45f1-90ed-ae2ce063378a		granate-oficial	2026-06-22 14:09:51.761302+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2000	#9f1239	f7c342d7-af4c-433b-8aa9-f0d1e25b1891	2026-06-22 14:09:51.761302+00	--sede-color-primary
a2885913-d868-4e37-a746-62eabc544ce1		granate-oficial	2026-06-22 14:09:51.762017+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2001	#881337	beed7adc-17b4-482d-96a8-294e158c559d	2026-06-22 14:09:51.762017+00	--sede-color-primary-hover
94174f4c-5f41-4e7d-8a28-258290f05d2a		granate-oficial	2026-06-22 14:09:51.762676+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2002	#fff1f2	e6bd96c1-1be8-4722-8abe-50efd9e1db3d	2026-06-22 14:09:51.762676+00	--sede-color-primary-50
55091df4-6f90-426a-815a-f916e27bad87		granate-oficial	2026-06-22 14:09:51.763277+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2003	#ffffff	f3afad52-a250-40f2-887c-9e06b8385f5e	2026-06-22 14:09:51.763277+00	--sede-color-primary-contrast
26f91584-fdaf-4d68-89de-bb40e6dd9387		granate-oficial	2026-06-22 14:09:51.763925+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2004	#be123c	f3576ad4-187c-40be-89f8-f68299a25d83	2026-06-22 14:09:51.763925+00	--sede-color-link
e9af6442-edac-499d-8534-9880a773fea7		granate-oficial	2026-06-22 14:09:51.764599+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2005	#fff7f9	0a273001-24b8-488e-896d-c79f2d7bedb2	2026-06-22 14:09:51.764599+00	--sede-color-bg
4fb99cda-6e8e-41ab-bc4e-a9e313f7bfae		granate-oficial	2026-06-22 14:09:51.765632+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2006	#ffffff	9a99ee8f-2a45-4ddd-b996-c16f33646ec9	2026-06-22 14:09:51.765632+00	--sede-color-surface
2e1235c2-86ec-4d0f-ae2d-3879b1eccc1f		granate-oficial	2026-06-22 14:09:51.767806+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2007	#111827	60158a8d-b488-4c43-aacb-9953d489936f	2026-06-22 14:09:51.767806+00	--sede-color-text
4db58d87-1d73-42fc-a049-805c961ed220		granate-oficial	2026-06-22 14:09:51.769109+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2008	#4b5563	4e1c78a5-1717-488a-b813-cdedef90a3ef	2026-06-22 14:09:51.769109+00	--sede-color-muted
8c6f2dd6-461a-4de5-931b-41dcabde90fd		granate-oficial	2026-06-22 14:09:51.769925+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2009	#fce7e7	da966225-0ec9-4322-a34a-39f01ff40ba9	2026-06-22 14:09:51.769925+00	--sede-color-border
f94df01c-47b5-42c9-8d69-e51329bfebeb		granate-oficial	2026-06-22 14:09:51.77074+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2010	#4c0519	0a8a25d4-4588-46e6-9b8f-4d41d662b541	2026-06-22 14:09:51.77074+00	--sede-color-hero-bg
53284f37-6774-4b0a-9f64-c9452e978c4a		granate-oficial	2026-06-22 14:09:51.771519+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2011	#fff1f2	0520ac59-38ab-40fb-afe7-712c7b121e71	2026-06-22 14:09:51.771519+00	--sede-color-hero-text
c4ef75ee-0c80-4138-b64e-7c90f024e08c		granate-oficial	2026-06-22 14:09:51.772284+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2012	#fecdd3	ac297879-e885-4909-ad0d-1bbf20e9a2e9	2026-06-22 14:09:51.772284+00	--sede-color-hero-subtitle
2c7b8685-63c0-4720-8133-33c31f3f1e4a		granate-oficial	2026-06-22 14:09:51.772932+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2013	rgba(159, 18, 57, 0.10)	79fa65ad-35a8-46e9-abcf-f5d8ce664e68	2026-06-22 14:09:51.772932+00	--sede-color-calendar-date-bg
5b27ba5c-ed85-4541-bad4-4624d923fa75		granate-oficial	2026-06-22 14:09:51.773607+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2014	#be123c	0cd9a839-9de8-4cdb-a1e9-ee4250c3a3b5	2026-06-22 14:09:51.773607+00	--sede-color-calendar-date-text
5aaa765a-50f5-4556-92e7-db6de778d87e		granate-oficial	2026-06-22 14:09:51.775543+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2015	#4c0519	1ddab331-abbb-4994-9c1e-bd33470ac95f	2026-06-22 14:09:51.775543+00	--sede-color-footer-bg
7b889027-d8bf-4867-b00a-7b151dcd28e9		granate-oficial	2026-06-22 14:09:51.777703+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2016	#fda4af	036e15f8-70c3-4cfe-bc89-8f4ee093d2e8	2026-06-22 14:09:51.777703+00	--sede-color-footer-text
717d30df-4446-4ade-a5fc-a52c4f6cd065		granate-oficial	2026-06-22 14:09:51.778792+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2017	#f43f5e	d9e7b8d2-a959-4049-958e-ddd92fc79b4d	2026-06-22 14:09:51.778792+00	--sede-color-primary
3db39f33-1adc-49fd-8afe-c66d15c3fc97		granate-oficial	2026-06-22 14:09:51.779525+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2018	#fb7185	8cf50040-d702-4e06-a88b-9e45fec0bc0e	2026-06-22 14:09:51.779525+00	--sede-color-primary-hover
d5281acc-3aa8-4077-87b5-c3ec31b00a6a		granate-oficial	2026-06-22 14:09:51.780102+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2019	#4c1025	2cd0ffd2-1586-4813-8cbe-8a3cd9e0b1a2	2026-06-22 14:09:51.780102+00	--sede-color-primary-50
f76c970f-0bdf-4191-8cf8-820ab8982001		granate-oficial	2026-06-22 14:09:51.780709+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2020	#ffffff	ab79dca0-ba9c-473e-8dd0-3913a21bafcb	2026-06-22 14:09:51.780709+00	--sede-color-primary-contrast
65385495-cf28-435d-a971-053263c10c3b		granate-oficial	2026-06-22 14:09:51.781417+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2021	#fb7185	8a688bd1-6a6e-4d55-a09f-e5de99f16334	2026-06-22 14:09:51.781417+00	--sede-color-link
781c803e-2f56-44d8-848c-cde67bd99e0e		granate-oficial	2026-06-22 14:09:51.782186+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2022	#1a0a10	0201d213-d228-4478-8552-9e990738c791	2026-06-22 14:09:51.782186+00	--sede-color-bg
1c3c047d-c8eb-47e2-82ad-7c576dd50374		granate-oficial	2026-06-22 14:09:51.782943+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2023	#2d1019	a28ae034-f9fc-494a-a0a1-6f41e919e84c	2026-06-22 14:09:51.782943+00	--sede-color-surface
66387237-f7b7-4816-ad5d-f4503536641c		granate-oficial	2026-06-22 14:09:51.784082+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2024	#fff1f2	d1d1b238-84b1-4181-960f-96dcfd27515e	2026-06-22 14:09:51.784082+00	--sede-color-text
d2af4f9c-aa70-415a-8196-79c545c90946		granate-oficial	2026-06-22 14:09:51.785159+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2025	#fda4af	4ac73f8e-5fc8-4903-8935-bccffe8b22ad	2026-06-22 14:09:51.785159+00	--sede-color-muted
b0b31d28-6e40-4f2d-a222-ba24ac74351a		granate-oficial	2026-06-22 14:09:51.786549+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2026	#4c1525	b4efd817-d8cb-4e3d-8a79-f8733af7dc13	2026-06-22 14:09:51.786549+00	--sede-color-border
d10f901b-1509-4376-af8d-f09a78bab65c		granate-oficial	2026-06-22 14:09:51.788255+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2027	#120508	a3a3ede4-9aec-49d9-996e-659f1e609d9d	2026-06-22 14:09:51.788255+00	--sede-color-hero-bg
ad217fc5-4ec6-43a8-926b-4915db05dea1		granate-oficial	2026-06-22 14:09:51.789269+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2028	#fff1f2	d7033a9d-cc12-4aa3-b627-dba8fff0b981	2026-06-22 14:09:51.789269+00	--sede-color-hero-text
2fe6f29c-0de1-4042-9525-c8bace816f5a		granate-oficial	2026-06-22 14:09:51.790015+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2029	#fda4af	27ea017d-a17b-4c7c-855d-a4f3873a9b11	2026-06-22 14:09:51.790015+00	--sede-color-hero-subtitle
a9320b9f-0973-43b4-a271-1e952541b15b		granate-oficial	2026-06-22 14:09:51.790865+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2030	rgba(244, 63, 94, 0.15)	80447d16-e58b-4014-8d19-9ba68fa0dbc5	2026-06-22 14:09:51.790865+00	--sede-color-calendar-date-bg
44f2d9fc-2533-46c3-a206-431a7fa82180		granate-oficial	2026-06-22 14:09:51.792001+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2031	#fb7185	f7fcfda2-4cf3-40a9-9278-e771e745b16a	2026-06-22 14:09:51.792001+00	--sede-color-calendar-date-text
0e89caf7-5297-4bb3-88cf-c7fa42ab8720		granate-oficial	2026-06-22 14:09:51.793147+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2032	#0a0305	19206099-bfc1-4b83-a031-6517e8a48aad	2026-06-22 14:09:51.793147+00	--sede-color-footer-bg
c2d90570-e84e-40f8-85e3-481fc642c374		granate-oficial	2026-06-22 14:09:51.794303+00	\N	THEME	\N	\N	light-ES	\N	f	Granate Oficial	2033	#94a3b8	14764736-90f2-4ac3-9649-a95f77e85a3e	2026-06-22 14:09:51.794303+00	--sede-color-footer-text
73dcf398-ce95-4d35-98e0-df23145016ef		Amarillo	2026-06-22 14:09:51.795633+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3000	#000000	ea7e25a8-d5b6-4921-bc56-15746a418bdc	2026-06-22 14:09:51.795633+00	--sede-color-primary
951ea6c3-5d3c-4b24-bd0e-8174b91e33be		Amarillo	2026-06-22 14:09:51.797875+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3001	#f0cf28	0568ecc8-5aa5-4eaa-acc5-379e0893ecee	2026-06-22 14:09:51.797875+00	--sede-color-primary-hover
baa83126-65dc-4ab5-ba2d-c46f52ccfd9e		Amarillo	2026-06-22 14:09:51.799486+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3002	#eaebad	cd706b3e-c2ea-45dd-972a-503bcc97ca9c	2026-06-22 14:09:51.799486+00	--sede-color-primary-50
756daefa-7c7d-4021-8ae3-42c10fac953c		Amarillo	2026-06-22 14:09:51.800542+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3003	#fffee5	272fc814-f763-4924-9d12-6a8f8f6b7229	2026-06-22 14:09:51.800542+00	--sede-color-primary-contrast
78880b25-cdcc-4f11-84d1-20f5ccd7c06e		Amarillo	2026-06-22 14:09:51.80142+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3004	#c3be22	cdb94d9c-a6e2-4fc4-8648-1879a0f17350	2026-06-22 14:09:51.80142+00	--sede-color-link
4cbad389-9ef9-4f56-a6b6-8893c55dde8c		Amarillo	2026-06-22 14:09:51.802271+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3005	#fffff5	78921d2e-dba9-4015-8939-1160553b8d9c	2026-06-22 14:09:51.802271+00	--sede-color-bg
de4b566f-803d-4e9f-ab0c-a3b34aa7648d		Amarillo	2026-06-22 14:09:51.80304+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3006	#ffffff	a0ae9a38-47f8-4155-9cfc-adabbedccd72	2026-06-22 14:09:51.80304+00	--sede-color-surface
37521376-3576-49a9-8ef1-4821e33bed79		Amarillo	2026-06-22 14:09:51.803863+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3007	#0f172a	ba607c33-f543-441e-b991-780810818cd6	2026-06-22 14:09:51.803863+00	--sede-color-text
7d89b5c4-9387-45e5-9a60-db64f8755de8		Amarillo	2026-06-22 14:09:51.804718+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3008	#4b5563	b53276dd-c9e7-48cf-9267-05ebed9ea82b	2026-06-22 14:09:51.804718+00	--sede-color-muted
4ecc722b-3a2e-4297-8edc-daee77e178e2		Amarillo	2026-06-22 14:09:51.805612+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3009	#d6d902	4a1a79b1-0484-41e9-a7db-d618be4961d8	2026-06-22 14:09:51.805612+00	--sede-color-border
9db31613-d68d-434e-a362-ae147245abd3		Amarillo	2026-06-22 14:09:51.806461+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3010	#999400	87a67667-652b-420d-abc9-70d1647ef148	2026-06-22 14:09:51.806461+00	--sede-color-hero-bg
c7ed382c-b72d-47d0-8e33-65712861c1da		Amarillo	2026-06-22 14:09:51.807386+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3011	#fdfdf2	247b2b5b-e16b-4c7d-a5d1-054183f30eb2	2026-06-22 14:09:51.807386+00	--sede-color-hero-text
bcdaf2b5-86db-4273-9664-eb5c52f63496		Amarillo	2026-06-22 14:09:51.808711+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3012	#f7f2bb	a6af8a8c-69f5-4670-b527-ebd4f6a67a30	2026-06-22 14:09:51.808711+00	--sede-color-hero-subtitle
c8bb3e4c-e134-49f2-8f70-39fc6847216c		Amarillo	2026-06-22 14:09:51.809795+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3013	rgba(225, 234, Amarillo, 0.10)	307e628f-7305-4116-b6cc-4a044e1384ea	2026-06-22 14:09:51.809795+00	--sede-color-calendar-date-bg
3503f9ae-249b-42f6-a015-d4f26184144b		Amarillo	2026-06-22 14:09:51.81091+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3014	#e8b709	974afaa7-8f7d-4dd8-aa66-a21cad172e82	2026-06-22 14:09:51.81091+00	--sede-color-calendar-date-text
1d9d42ef-020a-4f28-8caa-bc158eb0fb1b		Amarillo	2026-06-22 14:09:51.811944+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3015	#b5be3c	e0e307ca-858c-473d-92ab-97d95274f01f	2026-06-22 14:09:51.811944+00	--sede-color-footer-bg
aa4d11fe-92c8-43e1-bb61-35206d60202f		Amarillo	2026-06-22 14:09:51.81279+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3016	#000000	45d39bd7-dc2a-467c-944a-d3b30ef411ad	2026-06-22 14:09:51.81279+00	--sede-color-footer-text
a0d66586-837a-411b-9cc3-6d4a591f82e2		Amarillo	2026-06-22 14:09:51.813546+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3017	#2dd4bf	fe4b135b-213b-4ab8-8f51-7bf9b30395db	2026-06-22 14:09:51.813546+00	--sede-color-primary
971e4b5e-f1f4-4d91-96fe-8d07fa025f16		Amarillo	2026-06-22 14:09:51.814318+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3018	#5eead4	703b74e3-4121-470f-b49c-1ebb1fdf720c	2026-06-22 14:09:51.814318+00	--sede-color-primary-hover
8b67304d-7443-4a5b-9d11-e543aae32130		Amarillo	2026-06-22 14:09:51.81521+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3019	#134e4a	5c78af28-fabd-4a99-8ee7-96c45668d355	2026-06-22 14:09:51.81521+00	--sede-color-primary-50
c6392a27-5675-4a22-b8a7-dc4eb9d11d99		Amarillo	2026-06-22 14:09:51.817258+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3020	#042f2e	2426884f-16d5-420e-a055-42d23c8d1c20	2026-06-22 14:09:51.817258+00	--sede-color-primary-contrast
2c7983b1-9e27-4cb0-beb6-7d2d28cbf928		Amarillo	2026-06-22 14:09:51.818891+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3021	#2dd4bf	703f8f88-77c7-405f-b67a-5805e4d3d23a	2026-06-22 14:09:51.818891+00	--sede-color-link
1fbabbc8-dfb6-4196-a2b7-0bf795a04141		Amarillo	2026-06-22 14:09:51.819661+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3022	#042f2e	45bf718b-e023-47f8-9cc9-fbe4671fc98f	2026-06-22 14:09:51.819661+00	--sede-color-bg
5c0a938a-4796-4dba-a5e5-aad349619840		Amarillo	2026-06-22 14:09:51.82034+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3023	#134e4a	4e14b37a-b9cc-4f4c-9a82-1611966c3007	2026-06-22 14:09:51.82034+00	--sede-color-surface
ab12193e-da24-4a40-b141-f58f44c39f2a		Amarillo	2026-06-22 14:09:51.821025+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3024	#f0fdfa	9fb025df-a920-415a-b280-7f77cab2e59d	2026-06-22 14:09:51.821025+00	--sede-color-text
831aea4e-a7e9-4c8c-a7a5-f55179171967		Amarillo	2026-06-22 14:09:51.821957+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3025	#5eead4	230f1482-e3d9-4b32-a683-cb1499afb92b	2026-06-22 14:09:51.821957+00	--sede-color-muted
8f3f4d7b-68b2-48ff-bde8-b15eb91af22b		Amarillo	2026-06-22 14:09:51.822584+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3026	#1a5c56	f7d7803a-f6d0-4f94-a613-563cfc84e90c	2026-06-22 14:09:51.822584+00	--sede-color-border
721800c2-b904-42cc-940f-d11cb97f2f5f		Amarillo	2026-06-22 14:09:51.823401+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3027	#022c22	7352dcaa-a081-419e-848a-032a3c5b7b79	2026-06-22 14:09:51.823401+00	--sede-color-hero-bg
4eaa6401-d3d4-4301-aa62-dce323351792		Amarillo	2026-06-22 14:09:51.824287+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3028	#f0fdf4	c3cf50a8-ac05-42ba-86d7-6f38ba708a92	2026-06-22 14:09:51.824287+00	--sede-color-hero-text
9ef63f37-4900-4a99-aee5-44cb3c54da49		Amarillo	2026-06-22 14:09:51.825161+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3029	#5eead4	093781e2-f2a5-44a1-802c-b0b23069ddf3	2026-06-22 14:09:51.825161+00	--sede-color-hero-subtitle
3b809084-13b9-47a1-b940-a286c619f5c3		Amarillo	2026-06-22 14:09:51.825779+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3030	rgba(45, 212, 191, 0.15)	e455001d-50ec-4558-81bf-34caea261853	2026-06-22 14:09:51.825779+00	--sede-color-calendar-date-bg
369fe80b-4599-473c-8c56-0d14445a0312		Amarillo	2026-06-22 14:09:51.826335+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3031	#2dd4bf	a7c97491-b5af-4e06-9e18-5ad1edf55b14	2026-06-22 14:09:51.826335+00	--sede-color-calendar-date-text
fa0e61ab-68dd-491f-8ea4-b75c9ea8a2f3		Amarillo	2026-06-22 14:09:51.826843+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3032	#022c22	c12cb33a-2c6f-48e2-9c4c-89386a220fae	2026-06-22 14:09:51.826843+00	--sede-color-footer-bg
ee1817dc-3a7d-4f8c-adcd-ab7028834c44		Amarillo	2026-06-22 14:09:51.827442+00	\N	THEME	\N	\N	light-ES	\N	f	Amarillo Administrativo	3033	#5eead4	e425bd57-774a-49b4-a78c-f9d46c5f99d5	2026-06-22 14:09:51.827442+00	--sede-color-footer-text
\.


ALTER TABLE public.public_content_entries ENABLE TRIGGER ALL;

--
-- Data for Name: security_audit_log; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.security_audit_log DISABLE TRIGGER ALL;

COPY public.security_audit_log (id, action, app_context, client_ip, details, resource_type, resource_uuid, result, "timestamp", user_id) FROM stdin;
b7a4d4ae-ddd5-4728-9ae9-1f55427e48bd	LOGIN	API	172.21.0.1	User not found: admin@tfm.es	USER	\N	FAILURE	2026-05-19 19:56:46.507137+00	\N
9d30f4ec-7779-4a7f-8ad2-5af27db6f301	LOGIN	API	172.21.0.1	User not found: admin@tfm.es	USER	\N	FAILURE	2026-05-19 19:56:51.076547+00	\N
6b69b9e7-1f1d-496d-bcbd-ccac97323692	LOGIN	API	172.21.0.1	User not found: admin@tfm.es	USER	\N	FAILURE	2026-05-19 19:58:26.720277+00	\N
64bd89dc-0b75-4fab-a8a8-6e6d4ffb7b92	LOGIN	API	172.21.0.1	User not found: citizen@tfm.es	USER	\N	FAILURE	2026-05-19 19:58:31.132483+00	\N
931f883e-35df-4621-9160-8cf29a59baf7	LOGIN	API	172.21.0.1	Token refresh failed - invalid token	USER	\N	FAILURE	2026-05-19 19:58:31.144311+00	\N
87e26664-601d-4a36-b422-bcdc1117bc56	LOGIN	API	172.21.0.1	User not found: citizen@tfm.es	USER	\N	FAILURE	2026-05-19 19:58:31.159606+00	\N
544ded92-bc48-4ee4-9b4d-8338e3b31042	LOGIN	API	172.21.0.1	User not found: admin@tfm.es	USER	\N	FAILURE	2026-05-19 19:58:52.327005+00	\N
1e4520b3-fa32-4a3e-8e3f-8eb7de9878c5	LOGIN	API	172.21.0.1	User not found: admin@tfm.es	USER	\N	FAILURE	2026-05-19 19:59:32.04515+00	\N
97131d36-e336-4e13-a90c-1a7f6d0d0e18	LOGIN	API	172.21.0.1	Token refresh failed - invalid token	USER	\N	FAILURE	2026-05-19 19:56:46.507137+00	\N
56fd45b3-dfc5-4fff-aa56-3da1ff3389fb	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-19 20:04:23.432463+00	\N
f192ea41-e72d-4ae7-ace6-7c33203819bf	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-19 20:04:32.181689+00	\N
91a3a39e-f77d-45f2-8e2c-4d88a12f37c8	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-19 20:04:34.248293+00	\N
b1c8eb9a-55d3-4819-835d-a3ea5108f122	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-19 20:19:58.06602+00	\N
9cefd8ad-ec0d-4788-95cf-cae68125cad6	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-19 20:21:15.363915+00	\N
d344c04e-8b06-4a8b-b8f5-844c3d0408da	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-19 20:21:24.484016+00	\N
1f43ef1b-3bba-4c1f-a315-72d3bf550f33	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-19 20:37:39.768314+00	\N
5f3fe569-8b32-43e1-ad79-eff11ae15734	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-19 20:37:41.602265+00	\N
d7eee67f-ea95-4244-9e2e-38c885a3ea5a	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-19 20:37:52.072516+00	\N
84ca6405-5574-43dc-8f7d-975f602a2542	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-19 20:57:19.653925+00	\N
a78bbd5f-5a87-40b5-b6ff-5c1d1d89081f	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-19 20:58:32.635166+00	\N
d0f6bf9d-cae7-41d9-b027-b6d67a6c1b1b	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-19 21:15:05.378054+00	\N
caccce5f-253c-49aa-a0f7-8ef901710ae2	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-19 21:29:12.619839+00	\N
cd361540-c82a-43e7-9b80-f2d22a2995bd	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-19 21:30:26.862438+00	\N
4a2afa59-3423-4973-aecd-2468c18ec25e	LOGIN	API	172.21.0.1	Invalid password for citizen@tfm.es	USER	\N	FAILURE	2026-05-19 21:36:08.66524+00	\N
a4f98f85-b2ea-4734-b731-4e8c5dc51763	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-19 21:36:27.925783+00	\N
e83fd7cf-3e00-45fa-8450-f35b3ae6a64e	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-19 21:51:56.052398+00	\N
09a3f82a-694f-476c-a994-41c5c68076ab	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-19 21:56:42.549901+00	\N
348c8c35-912a-4354-8b25-703265806708	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-19 21:57:39.274097+00	\N
8103c64c-01a3-4718-9faf-51fb5cd1557c	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-19 21:57:45.779364+00	\N
8ce1f7d7-c6f3-4879-ad7a-6cc50f34b1c3	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 04:45:32.897503+00	\N
d9dd7b37-6f85-4fa0-bb57-e328d4d72194	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 04:45:47.361888+00	\N
25cce6fb-1992-416a-a9b0-29f29bfb3a74	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 04:47:47.139148+00	\N
4f61f8b2-35e7-40ac-aa5c-5c833f28e4e0	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 06:18:51.049447+00	\N
c1fe4d3a-2b4e-4f96-b665-f4559d4b4192	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 06:19:10.55492+00	\N
fbda3ed4-43ac-471b-b966-7a0bc08802d6	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 06:35:57.70211+00	\N
a2be8998-79c9-4ab1-82d5-c20774adacc8	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 06:36:05.537658+00	\N
6ca36c4e-c695-474d-8556-45e64cab2ab9	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 06:51:07.011849+00	\N
6bef9398-5c13-4cb1-a09c-7ed16c23517b	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 06:51:26.847387+00	\N
c6e87c27-c725-4419-abd4-fe8895a63946	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 07:04:44.00228+00	\N
4b55003c-1484-4ea6-af33-b7ebfd136e38	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 07:04:49.54843+00	\N
64cae602-815e-471f-98ba-da1c65e8935b	LOGIN	API	172.21.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 07:19:44.871854+00	\N
4a1a544e-7b2a-4c71-80f9-02c5368f8b4b	LOGIN	API	172.21.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 07:20:44.850226+00	\N
777b1f8e-39d2-4328-879c-79404a09ad57	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 07:36:30.209594+00	\N
d40e7290-0278-4062-b45f-7aa4640aa236	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 07:36:44.340171+00	\N
ffeff2e8-62c0-4de1-b380-dca9ae772acf	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 07:51:40.905845+00	\N
8c0d0b3b-1828-433f-883d-0b04f9e7e4df	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 07:51:59.15106+00	\N
ce0a1383-3aa3-46c2-8ede-9e3681c5603d	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 11:27:33.156954+00	\N
bcdef84a-7f99-41fb-9596-aba2d98d3ed7	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 11:28:03.140786+00	\N
7a09b638-598e-44e1-a94c-37999dca8ea6	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 13:53:09.485506+00	\N
a1f26fb1-6603-4b44-855c-ce8dda73abdb	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 13:53:18.663996+00	\N
540f323f-2b1f-4fca-a84a-e681b27c4347	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 13:54:27.199283+00	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c
c8e89fcc-172b-4609-930f-f8c013cf41aa	LOGIN	API	172.21.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 14:08:18.775693+00	\N
d97cc65b-e3bd-4153-a846-8e1b7b906f7e	LOGIN	API	172.21.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 14:09:44.829753+00	\N
7ba64802-c81d-4683-82e2-e87e71c507d4	LOGIN	API	172.21.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 14:23:44.829393+00	\N
743a3be0-f6e0-40c0-8440-b445e89bd25e	LOGIN	API	172.21.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 14:25:00.868928+00	\N
ddd95c29-3041-4d85-80d6-53ece155db9d	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 14:39:10.900762+00	\N
aaa7f9f9-5e5c-486c-9491-415eefa17945	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 14:40:29.053073+00	\N
c7be7c67-9a73-4406-8e11-7c4256fdd2c7	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 14:40:31.555529+00	\N
a41a7edf-5b7b-455e-9abd-de84702cd005	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 14:55:34.291572+00	\N
e18b24f4-577c-452b-82d1-b34222291b70	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 14:58:27.406195+00	\N
c58995d0-856a-4a4a-a87b-eca6a22d42d3	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 14:58:38.887197+00	\N
5adbedb7-2729-4a28-9bd6-581a9546a854	LOGIN	API	172.21.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 15:13:44.837702+00	\N
fc3de4ae-d8c0-46d4-b56c-dad99887face	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 15:19:56.885305+00	\N
f02a1a40-da33-4678-84bd-44564c38279d	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 15:19:59.115503+00	\N
8f5e6981-f79b-4ecb-a524-335ae271ba2d	LOGIN	API	172.21.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 15:20:26.847111+00	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c
738ac736-1f5f-4306-9422-d12ae179b25f	LOGIN	API	172.21.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 15:21:29.826059+00	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c
0ae763e2-e581-4a3f-b4e5-1f5847271677	LOGIN	API	172.21.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 15:21:29.943192+00	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c
ecef8300-5806-4eaa-a31d-071a3c41bab1	LOGIN	API	172.21.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 15:22:29.895511+00	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c
a228ca3d-44b3-48bf-9ec8-6e97d98ad1bb	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 15:28:44.856351+00	\N
600c6fa7-3328-4018-8b07-c34fcfdcc293	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 15:31:27.473773+00	\N
e0b8bd23-ed61-4e27-b3c4-64dde909ba3c	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 15:37:44.843862+00	\N
6611cf8a-1a92-415c-8e81-39cb95bd3f89	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 15:39:04.535141+00	\N
1078f21a-e348-4068-b974-6d8e1ed59fb6	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 15:46:52.97793+00	\N
b728ed54-185b-47d5-9a76-65eeb0d4ceea	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 15:48:26.690737+00	\N
478da2d2-0c35-4d9d-a5a3-b90f9668b1df	LOGIN	API	172.21.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 16:03:26.722955+00	\N
be303009-17f8-47c1-91ea-6f39760bb2b1	LOGIN	API	172.21.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 16:18:26.722733+00	\N
43e73be9-59aa-4d2f-ac75-3400c3dba716	LOGIN	API	172.21.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 16:33:26.738486+00	\N
37a1e371-cae5-4707-8cad-ef2605618784	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-20 16:37:27.937428+00	\N
15ec73b3-009b-48a5-88ca-ed39ba839b49	LOGOUT	API	172.21.0.1	User logout	USER	\N	SUCCESS	2026-05-20 16:37:47.7247+00	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c
bfe510ce-d7b2-4ce0-9cff-f5f31755663f	CREATE	API	172.21.0.1	New user registered: fcastano.tsol@gmail.com	USER	\N	SUCCESS	2026-05-20 16:38:30.818478+00	\N
e0689094-9013-4a4b-a9ec-38bfd7019870	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 16:48:44.856667+00	\N
5ac27735-3d1b-49e9-8948-1a812b0c2e01	CREATE	API	172.21.0.1	New user registered: mailpit-test-1779296237@example.com	USER	\N	SUCCESS	2026-05-20 16:57:19.683688+00	\N
b258b379-f476-4a2f-bc8f-e979cd1addb5	CREATE	API	172.21.0.1	New user registered: mailpit-test-1779296618@example.com	USER	\N	SUCCESS	2026-05-20 17:03:39.937232+00	\N
04e6fd15-e85e-4c58-8201-3178cf0c6e6f	CREATE	API	172.21.0.1	Registration failed - email exists: fcastano.tsol@gmail.com	USER	\N	FAILURE	2026-05-20 17:12:14.713492+00	\N
70e6a7ff-c3fa-48af-af63-0eb8c624794d	CREATE	API	172.21.0.1	New user registered: fcastano.tsol.1@gmail.com	USER	\N	SUCCESS	2026-05-20 17:12:32.314013+00	\N
a44dda93-6616-4ba8-b0de-8d11d5534adb	CREATE	API	172.21.0.1	Email verified via token for: fcastano.tsol.1@gmail.com	USER	\N	SUCCESS	2026-05-20 17:12:42.766235+00	\N
1db7a2f5-5d22-43f4-9f4f-979466b097e1	LOGIN	API	172.21.0.1	Login successful for fcastano.tsol.1@gmail.com	USER	\N	SUCCESS	2026-05-20 17:12:58.441162+00	\N
37bccff7-857a-4bcc-a0af-31196ee06fcf	UPDATE	API	172.21.0.1	Profile updated for user: fcastano.tsol.1@gmail.com	USER	\N	SUCCESS	2026-05-20 17:13:13.18169+00	4a83bdd8-e96c-48e8-9b86-e2a872fc7747
4a35525f-983b-4d75-b64c-1fbdedb6c1c7	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 17:17:51.528552+00	\N
72c38bd3-8e57-46c9-ab6d-279af2930077	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-20 17:33:18.124562+00	\N
5b635ed6-0b01-4cf6-8eeb-a9c0047d213a	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-20 17:44:57.133655+00	\N
9ebb2185-b9e1-4857-89cf-952621c52d34	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-21 17:31:41.75148+00	\N
a02ee701-2d6e-4999-90cc-f6c5950d1e6b	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-21 17:31:55.396248+00	\N
7f0352ba-6a6b-4003-8680-6234edf025c4	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-21 17:32:32.668959+00	\N
257c1d0c-b25c-469b-9ea3-3c94fb0a6dc3	LOGOUT	API	172.21.0.1	User logout	USER	\N	SUCCESS	2026-05-21 17:37:15.580622+00	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c
f094d044-22ef-434a-b7a7-2bb1c78ad209	LOGIN	API	172.21.0.1	Login successful for fcastano.tsol.1@gmail.com	USER	\N	SUCCESS	2026-05-21 17:37:31.079267+00	\N
8f98282d-9999-42c3-866e-90f829ea7c72	LOGIN	API	172.21.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-21 17:46:42.395721+00	\N
dab07ec8-5463-4d90-a4a4-f76f36ccfda6	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-21 17:56:22.950949+00	\N
d41e0ba2-cf0e-44be-ade7-9ffe7489e61d	LOGIN	API	172.21.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-21 17:56:25.817715+00	\N
950e6224-efd5-4918-9ac4-9d4fac026a99	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-21 18:07:03.695901+00	\N
6225aeff-ac43-4127-ad30-69f10283cbd0	LOGIN	API	172.21.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-21 18:12:08.421956+00	\N
22ab6921-5438-4f9b-a9f1-aeade3f02152	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-21 18:22:13.904779+00	\N
fac74b23-1561-47d1-af63-61f26eda02cf	LOGIN	API	172.18.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-21 18:24:50.646961+00	\N
cee93af8-fdd2-4326-8aed-d8f334e8a29c	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-21 18:24:57.069013+00	\N
617924e3-6241-475b-a3c5-b2953e13d07d	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-21 18:50:38.085773+00	\N
3f619479-c26f-4057-8745-17026e7f3a0a	LOGIN	API	172.18.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-21 18:52:36.440428+00	\N
11c41ed0-9a2e-47c4-b837-c1330570bd82	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-21 18:52:42.321908+00	\N
7c09a097-a4eb-4774-be65-f929b2560733	LOGIN	API	172.18.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-21 19:06:06.683414+00	\N
6c2d30ea-7ca2-4ca5-8b24-798f1d274711	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-21 19:13:38.78813+00	\N
f6452c4a-6142-4e0f-a988-75315f51e7a8	LOGIN	API	172.18.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-21 19:21:08.401257+00	\N
8f831ab1-b572-4835-9965-0489ab5c1c87	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-21 19:27:42.03518+00	\N
f4dd9ba6-b5d9-497f-be75-f2d79d618aef	LOGIN	API	172.18.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-21 19:28:39.38647+00	\N
9f431191-d60c-4805-b2db-5beb17bb7fd9	LOGIN	API	172.18.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-21 19:42:47.67331+00	\N
0f85a69c-1c0d-4f99-909c-c2c39fab0727	LOGIN	API	172.18.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-21 19:44:08.397546+00	\N
29b4b3cf-a4df-4ccc-b4e6-4259c5fd0590	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-21 19:53:39.375088+00	\N
b1a3badd-d2f5-48e7-a943-e1d0731dfa3a	LOGIN	API	172.18.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-21 20:09:08.410001+00	\N
4d962b71-720e-4e4f-82fc-31a35ed9f514	LOGIN	API	172.18.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-21 20:24:31.837787+00	\N
2525f144-0cff-4e6e-a168-65ac44c1e8b4	LOGIN	API	172.18.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-21 20:39:48.010453+00	\N
34ff80d4-6c4c-450b-a068-26674809bb8a	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-21 20:39:54.487611+00	\N
c127539c-9323-4d60-b560-db955642bed5	LOGIN	API	172.18.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-21 20:56:49.372758+00	\N
9994f542-00be-40b3-935b-acbdb6f0c7c2	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-21 20:58:20.258874+00	\N
4d414b75-f317-4256-acb1-19ab70f43d8e	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-21 21:00:54.694181+00	\N
43ac00df-ba69-4e87-81ff-05693bb185c9	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-21 21:11:10.325485+00	\N
36aa5ff8-a527-4726-b170-d4241ed51343	LOGIN	API	172.18.0.1	Token refresh failed - token already rotated	USER	\N	FAILURE	2026-05-21 21:16:00.404033+00	\N
5fcc4f02-f883-4dc8-917f-13e4b03e700a	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-21 21:21:49.735217+00	\N
fe68aaa7-1d63-4c35-a89b-0c0da84788f9	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 10:03:57.719323+00	\N
f0215f4b-3f24-4458-bf8d-6c7c5f33ef99	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 10:06:30.048274+00	\N
5782ece3-9c11-4849-8d57-3f93b2709333	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-22 12:07:23.755439+00	\N
7bc59c07-3be6-47ad-abd3-d6a60ecdd8be	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-22 12:07:38.768015+00	\N
a98cb688-b882-4ba0-b16e-e8c4db79b0c6	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-22 12:07:58.998741+00	\N
3e6e484c-f7ae-4ff7-9318-518437da5a4b	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-22 12:08:57.854206+00	\N
2c497eba-248f-4b7d-88fb-957c9d779c60	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-22 12:08:57.860092+00	\N
42aafada-052e-450a-9430-380fff2820ae	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-22 12:08:58.217733+00	\N
6e138a86-b3d8-4f1f-b632-ec7e011a15e7	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-22 12:08:58.287223+00	\N
eaa8b14a-ad2f-427f-b852-cdc680f89871	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-22 12:29:37.872259+00	\N
56b642e9-d97e-47b5-8dd2-71a387189962	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 13:10:04.329598+00	\N
d844bbf8-2575-4596-8d6e-732daaa1a0fc	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-22 13:10:05.623558+00	\N
a2519612-9012-43b5-828f-2739c4dabcee	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 13:21:53.418227+00	\N
f8bfda66-5f77-4ad3-8bfc-be542544d256	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-22 13:32:40.185005+00	\N
5e13bf92-1ba7-454c-b8c1-39c6205a69f9	LOGIN	API	172.18.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 13:37:00.750355+00	\N
e679ec2a-43c1-4159-b06a-cfb3fa02f689	LOGIN	API	172.18.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-22 13:48:08.387365+00	\N
7ebdfd4a-8fe0-4d15-9011-e4b6e738327d	LOGIN	API	172.18.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 13:52:14.307499+00	\N
05fc2f5b-c087-483b-8a26-c3f9c8303ab2	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 14:07:17.422283+00	\N
1ba46865-d65d-4740-998b-2ac25320f5bb	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-22 14:08:00.651331+00	\N
15ed5fbb-f04b-468a-9dec-9725e88c1def	LOGIN	API	172.18.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 14:22:35.292124+00	\N
d604f7f8-b72a-4ec9-ba11-ca8b6682b7e3	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 14:38:27.710383+00	\N
d3ccd0aa-7860-4d80-8e6c-24c6497fc2aa	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 14:41:50.653555+00	\N
cbbd1b28-f65b-4142-b0c1-6526d867aef7	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 14:47:19.498203+00	\N
384ec28f-31a2-4d6a-8a63-cd4f2ae10de4	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 14:54:00.10817+00	\N
6f021d2c-6925-45bb-8dcd-905c6b93dab5	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 14:55:50.196307+00	\N
e773629f-238b-4128-a910-d339fc8eed0e	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 15:00:39.22947+00	\N
79e53857-a373-4806-85fa-73377e331bb5	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 15:04:29.14285+00	\N
bcd8fc94-5b1a-47b5-9378-e60280d69c13	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 15:07:35.618624+00	\N
2dd926e1-d0a3-49b1-93c9-55bcf332de46	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 15:12:01.811268+00	\N
0387c793-2c7e-4be2-86b0-81b2c5205b69	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 15:15:09.493878+00	\N
9279acd0-4fd7-4984-977d-afaf757839c3	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 15:17:45.097986+00	\N
e838d241-f859-4cf8-bf36-7bfa718593a9	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 15:22:31.922985+00	\N
5deeb9b8-892e-4dce-b8da-eed3040bed33	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 15:28:05.616728+00	\N
f716fe89-e7ac-4de7-a534-b8986420368a	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 15:34:21.677736+00	\N
9dde79d7-42a6-4242-a95b-0b928e230003	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-22 15:39:36.633683+00	\N
d669044c-6f83-4047-aa47-b493b2f1ba7c	LOGIN	API	172.19.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-22 15:40:31.317502+00	\N
67c2180d-69ff-4818-9372-3f61121774c2	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-24 22:07:33.041097+00	\N
f4876255-ec20-42da-afd7-6e0e5fc683dc	LOGIN	API	172.19.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-24 22:08:11.388324+00	\N
a209a298-e35d-4a3c-b2f9-9968c95f75d9	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-24 22:22:54.078595+00	\N
ee9c87a1-76b3-4b93-be4e-b6951803b22a	LOGIN	API	172.19.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-24 22:26:43.429475+00	\N
9f87a205-3509-4bec-a9a6-fd2f58a340ba	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-25 19:24:36.439529+00	\N
bcac6665-6f95-4c54-a53e-58c455fca897	LOGIN	API	172.19.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-25 19:36:55.978867+00	\N
06c5ad3a-d0d0-4a13-a79b-0a5520ff98cc	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-25 19:40:02.517408+00	\N
5528e035-590c-4364-8802-4cfe8e0b3892	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-25 19:52:14.161227+00	\N
0e2a5469-8579-4365-b925-7f233b8e3f32	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-25 19:55:13.851382+00	\N
932e6897-438e-4556-87da-ee7b5acd5903	LOGIN	API	172.19.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-25 20:08:46.901571+00	\N
ce43949f-1665-4723-b8e6-9d974016cff1	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-25 20:10:26.307553+00	\N
8b3f6d46-7695-4dc9-aaba-f15e91fe269a	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-25 20:23:46.493901+00	\N
57afd1c1-c793-49c0-95ea-c8dc8e61a714	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-25 20:27:16.322242+00	\N
b54d981b-d2fd-429c-bfc9-240ed74fae00	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-25 20:27:49.376592+00	\N
62d9ea07-1b88-45a8-a3af-1459fe3bf2f5	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-25 20:33:01.861763+00	\N
e87e1464-e852-49a8-9349-92aa3c2f0ea9	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-25 20:38:50.165781+00	\N
d8f0b0f7-0645-4d10-b193-d74871a7e910	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-25 20:48:13.873351+00	\N
7d3497ed-5f7d-4a1c-a065-6da958fe3637	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-25 20:53:50.106556+00	\N
1dd66ba0-a5ab-429f-8820-84a480b9f5b1	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-25 21:03:13.889831+00	\N
5e43ac97-6d68-40b6-a903-533a3c338112	LOGIN	API	172.19.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-25 21:10:31.380351+00	\N
55d8fde2-903b-43a0-b3a0-ce234c85804e	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-25 21:24:57.435959+00	\N
1b3ca875-adcd-4545-8e1e-8eefb1a33667	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-25 21:25:31.440942+00	\N
a88b4c21-df92-49c0-a6e2-fa4ce974dc6c	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 18:03:35.03321+00	\N
5fb55330-5f3c-4e83-b3f8-c70c5c6541c2	LOGIN	API	172.19.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-26 18:14:46.276289+00	\N
37fa558c-4b95-4426-a837-fecc34aeac05	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 18:19:01.777364+00	\N
c9a86911-6eae-43fa-ab15-842f0bd462d4	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-26 18:30:25.871007+00	\N
11a335fb-5b8b-4edb-9304-868f7f33f613	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 18:34:23.516332+00	\N
8c2ccbcd-1709-4463-8b14-8089bd2647ee	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-26 18:45:25.863702+00	\N
8da44f53-50d0-4d8d-9f3b-185af186ea5a	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 18:49:23.506806+00	\N
8e257e17-6046-48d4-80f0-9e5659c78312	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-26 19:00:25.838497+00	\N
b699a40b-7917-4693-b069-a3715db6763c	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 19:04:23.466082+00	\N
8ab3b603-8671-4ee1-b079-887b05b44850	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-26 19:15:25.873018+00	\N
f5ed86e7-91d2-4fa9-80bc-6f73c29b8345	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 19:19:23.474787+00	\N
4512a107-b92d-49ca-9ba1-5e78cab919a5	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-26 19:30:46.422082+00	\N
2ab8bc9a-4c9b-4b15-856c-ca960edda4d3	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 19:34:25.861343+00	\N
32dea4e5-87db-4262-aae5-d2e980f3d743	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 19:49:41.063945+00	\N
1fd0f782-cab0-4c86-9e64-fcb3c417ab69	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 20:04:46.477633+00	\N
74214b5a-3b27-4871-be75-c61ee4ffd535	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 20:19:46.505602+00	\N
a8828dde-d7b6-4b4d-ab41-bac0c219c63f	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 20:34:51.878812+00	\N
e326f1f0-dc3c-4612-bc0f-4afe3153fb34	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 20:50:00.673415+00	\N
1d928370-5dea-4895-97af-088482f5fa3a	LOGIN	API	172.19.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-26 20:54:08.49069+00	\N
8a42c62e-df33-4575-b5eb-3cadcf9f452e	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 21:05:00.254901+00	\N
8e8f1b59-aaa0-49e1-b52f-6fc71c6e904a	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-26 21:09:25.85539+00	\N
6bca35fe-4bb9-4267-93ec-a472223a6d2b	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 21:20:00.239581+00	\N
d3b36596-1323-4cdd-a4a2-cb0c571054b3	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-26 21:24:25.84399+00	\N
5fc1601f-e539-4dec-aa42-08e278265d3b	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 21:35:00.232691+00	\N
47011b5d-dc73-4e53-988e-0e6fb092f6cd	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-26 21:39:25.822819+00	\N
0c0d1b6a-5a83-4754-b52f-f63839428441	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 21:50:00.240074+00	\N
9d53c7ef-2a04-4376-8096-be3b93d45e71	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-26 21:54:38.550242+00	\N
502ecccb-6ebf-44d7-9e94-d602a02e7164	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 22:05:25.8341+00	\N
afce3f84-b7f1-4cac-95d5-a27d973699fd	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-26 22:09:38.577571+00	\N
7f63f2e5-0c3a-4ebc-9af8-663efc6a19c0	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-26 22:20:25.862648+00	\N
74676243-16b1-456e-b18c-1fd5c175ce6d	LOGIN	API	172.19.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-26 22:24:38.565203+00	\N
885c7b96-80c8-4804-8856-f1755f813674	LOGIN	API	172.22.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-27 20:31:01.576335+00	\N
8a067a9d-8d3e-4ff1-9c3b-28ce0af2a877	LOGIN	API	172.23.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-27 20:40:25.393345+00	\N
a22e0b80-39b7-49dc-af95-fb827a7e86ad	LOGIN	API	172.23.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-27 20:46:05.86551+00	\N
1ae6a751-9856-4e8a-9669-73eb05d4810b	LOGIN	API	172.23.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-27 20:56:08.81971+00	\N
b6da3735-2567-4965-93b7-cb1f46c8fedb	LOGIN	API	172.25.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 06:06:18.751042+00	\N
7f9f78ff-1b10-4d9b-9a5b-c1497fc2c0c7	LOGOUT	API	172.25.0.1	User logout	USER	\N	SUCCESS	2026-05-28 06:07:19.993877+00	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c
fff89111-11c3-4947-96a8-efa8e1d14990	LOGIN	API	172.25.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 06:10:04.692871+00	\N
81d728a5-1dc1-4524-96e0-46821856bd2a	LOGIN	API	172.25.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 06:12:10.515895+00	\N
2c63d86a-aa13-44cf-97a6-f5de7202c287	LOGIN	API	172.25.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 06:25:08.806442+00	\N
b80c45e7-74a2-4ab7-8e7e-ea93578b460e	LOGIN	API	172.25.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 06:40:08.829381+00	\N
562079df-c214-4a69-bd58-d6017f674805	LOGIN	API	172.26.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 12:14:26.546733+00	\N
63e6e115-359c-4655-ae82-3dfb470e3d8d	LOGIN	API	172.27.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 12:42:51.836861+00	\N
6f52e9fe-4ee1-4263-acbc-77362b349045	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 12:58:09.274414+00	\N
a7b17d52-244d-4b0c-aec6-1e4b25d0e37a	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 13:13:08.804747+00	\N
a0d08cfb-085f-4c7d-a5f7-0d97f23ccfbf	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 13:28:08.803171+00	\N
0fd735f6-106a-413b-95ec-ccb259e1eebc	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 13:43:08.854505+00	\N
b9ba739e-9d12-499b-a72e-444bd4b03eec	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 13:58:08.830778+00	\N
237c0fbb-f1aa-4429-bbb1-3a50b3691a46	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 14:13:08.83355+00	\N
7b1cadfe-f5bd-43e9-8a1a-9e6d9118e67a	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 14:28:08.809629+00	\N
52c814c9-603e-48c1-b29e-b59f461a7d85	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 14:43:08.839255+00	\N
69803c30-2776-48ea-b697-9d220b1407c1	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 14:58:08.844355+00	\N
bd9efa09-7386-4a7e-b207-79624c7ef9c6	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 15:13:08.827089+00	\N
9bafdea5-750e-4174-9f35-581e3c3ff890	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 15:28:08.854978+00	\N
1743b9b0-5766-4d15-831b-a89860e5df4e	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 15:43:08.841919+00	\N
ce11b138-34c9-46e9-9247-59e2204de824	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 15:58:08.834735+00	\N
4c2c3ee1-7fc0-4b10-9cad-3d69c7c2f981	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 16:13:08.827777+00	\N
c8fc1cfa-aee3-4751-9b36-e859920b941f	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 16:28:08.833787+00	\N
55ca79c0-e869-4532-8590-76697d46a406	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 16:43:08.830566+00	\N
d044f0da-ba71-4c4c-a9c2-6555b490d59a	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 16:58:08.842001+00	\N
2971ed63-9142-4af2-889d-be5a1bb3b232	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 17:13:08.828266+00	\N
d49c0729-b0c4-4f71-94bd-21cd1c274883	LOGIN	API	172.27.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 17:28:08.811083+00	\N
97c68c8d-b37f-42b2-8ccf-891c9051ebf1	LOGIN	API	172.30.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 19:52:59.251395+00	\N
2ddc9481-52b7-4708-98ff-c182505dc76a	LOGIN	API	172.30.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 19:56:49.005573+00	\N
2a4cdf2c-5393-4075-a6f1-b1f2f0f46d8a	UPDATE	API	172.30.0.1	Profile updated for user: citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 19:59:30.844757+00	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c
a235b5dd-f5b6-42f6-a180-e9eb1e3664fc	LOGIN	API	172.31.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 20:09:09.426824+00	\N
414fe1da-6152-4d84-96d5-fc5d85c23896	LOGIN	API	172.31.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 20:11:49.841169+00	\N
6d3f2ee9-5c90-4a63-b0c9-0866f68280e6	CREATE	BACKOFFICE	192.168.16.1	Issued formal notification with status AVAILABLE	FORMAL_NOTIFICATION	5b4cfb8f-dbc0-4454-b35b-83dd67dad256	SUCCESS	2026-05-28 20:17:53.601284+00	81151e14-514b-4b0e-8afb-d9353a48807a
f0721ca1-a25e-4b6f-9234-63545e43eac4	LOGIN	API	192.168.16.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 20:24:13.496054+00	\N
d9dc1adb-0697-4b78-948d-d2af3074a813	LOGIN	API	192.168.16.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 20:27:08.84078+00	\N
d43d5417-a4fd-4ab4-898a-853c9a619560	UPDATE	CITIZEN	192.168.16.1	Citizen resolved formal notification with status ACCEPTED	FORMAL_NOTIFICATION	5b4cfb8f-dbc0-4454-b35b-83dd67dad256	SUCCESS	2026-05-28 20:30:47.619937+00	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c
2b7cc604-8178-488d-a691-6173e54aad47	LOGIN	API	192.168.16.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 20:39:13.555214+00	\N
9353d5fc-109b-499d-87d3-2694cc57ee1c	LOGIN	API	192.168.16.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 20:42:08.849501+00	\N
c06e47c6-8fb3-4c9d-ac2a-e13c03a9ea42	LOGIN	API	192.168.64.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 21:34:38.14576+00	\N
1f58fb11-6ec6-4fe2-bee7-bb097d22d147	LOGIN	API	192.168.64.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 21:38:23.624869+00	\N
703035d0-0c99-4a75-9d48-2d6dd85d8db4	CREATE	BACKOFFICE	192.168.64.1	Issued formal notification with status AVAILABLE	FORMAL_NOTIFICATION	5c96d3a7-48b4-4fcd-ba04-0d6924defcee	SUCCESS	2026-05-28 21:38:49.485681+00	81151e14-514b-4b0e-8afb-d9353a48807a
26cb57a1-ce2b-4f04-86d8-aad5236e7a55	UPDATE	CITIZEN	192.168.64.1	Citizen accessed formal notification	FORMAL_NOTIFICATION	5c96d3a7-48b4-4fcd-ba04-0d6924defcee	SUCCESS	2026-05-28 21:39:04.767328+00	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c
487f3e09-5664-467a-86b2-f0c98c7c4233	LOGIN	API	192.168.64.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 21:41:13.809399+00	\N
a210b6eb-22cc-4d31-925a-10d611715e80	LOGIN	API	192.168.64.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 21:41:17.827725+00	\N
4a164a3a-3768-4f72-a749-60ef9bc6cf35	LOGIN	API	192.168.64.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 21:41:22.943934+00	\N
94d76c23-0a43-423c-86d1-6572e25b382c	LOGIN	API	192.168.64.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 21:41:28.131666+00	\N
bc313b2a-b1ff-4cf8-88ea-928c7aebd38a	LOGIN	API	192.168.64.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 21:41:35.95924+00	\N
ca404da1-36fe-4efa-a492-9fb29b5a2922	LOGIN	API	192.168.64.1	Token refresh failed - token hash mismatch for citizen@tfm.es	USER	\N	FAILURE	2026-05-28 21:49:38.202547+00	\N
33b35795-ef0c-47ea-ba17-1c12bc77008c	LOGIN	API	192.168.64.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 21:53:57.825087+00	\N
a4a43d1d-c1ca-4bad-9939-a2e2b48e622c	LOGIN	API	192.168.80.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 22:02:48.930399+00	\N
bf2a20ce-7ab6-49b7-82b7-b37bc0369eff	LOGIN	API	192.168.96.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 22:17:36.155569+00	\N
6f8ff0de-d6b1-4371-b634-350172b6bfa6	LOGIN	API	192.168.128.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-28 22:32:36.833227+00	\N
f3966555-f9f7-425d-b8c1-49715c2f28a5	LOGIN	API	192.168.128.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-28 22:33:09.3586+00	\N
8767e7ff-cab9-4ff1-ab72-2581afccd0eb	LOGIN	API	192.168.128.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-29 05:29:05.04417+00	\N
2ed828e8-eba1-4335-94e4-a3cb82a7b9c0	LOGIN	API	192.168.128.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 05:30:19.789202+00	\N
44cbd275-7ed1-4ad9-b041-b3f3dc1ad24f	LOGIN	API	192.168.128.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-29 05:44:08.815641+00	\N
ecfec06a-0849-43d1-bb3d-2288b6f3ae1f	LOGIN	API	192.168.128.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 05:45:19.865149+00	\N
61fbb2fb-928e-4689-a80f-6850157b9f93	LOGIN	API	192.168.128.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-29 05:59:08.907726+00	\N
f8da49f8-91d7-4192-adfc-591f401a930c	LOGIN	API	192.168.128.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 06:01:08.953721+00	\N
d7a83f3f-c12c-40f5-8204-f88d5f91aeed	LOGIN	API	192.168.128.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-29 06:14:08.914347+00	\N
b0dc3029-a031-4aa9-a26e-8c2e073b45bf	LOGIN	API	192.168.128.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 06:16:08.984968+00	\N
c7839581-3f03-48cb-bed6-6dd15962ac15	LOGIN	API	192.168.128.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-29 06:29:08.842746+00	\N
92d4033a-965b-4534-8b4d-9640a88f213b	LOGIN	API	192.168.128.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 06:31:09.042785+00	\N
6f5b8782-f168-4013-a283-309f6888c81a	LOGIN	API	192.168.144.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 13:03:54.793865+00	\N
5ae77b88-4ef2-4779-8ca4-cb5dd10f2ccc	LOGIN	API	192.168.144.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-05-29 13:04:10.613631+00	\N
90a174ca-3ead-435a-9391-f3315c8b785c	LOGIN	API	192.168.144.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 13:18:54.869436+00	\N
8ffa7c15-8b38-4b0b-aa14-3988672159e2	LOGIN	API	192.168.144.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-29 13:20:08.807744+00	\N
14ec6f80-08d0-4e56-862a-5de809f4d285	LOGIN	API	192.168.144.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 13:33:54.882694+00	\N
20c93476-fe15-483d-b327-b45b0e8000c4	LOGIN	API	192.168.144.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-29 13:35:08.811889+00	\N
12a9d47f-7573-4199-acb2-98892990d86e	LOGIN	API	192.168.144.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 13:48:54.849383+00	\N
b092fb12-c407-420e-bbab-14f6aa124db4	LOGIN	API	192.168.144.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-29 13:50:08.82581+00	\N
96cbd0ee-4eda-4cfd-9e0a-d4afe6d5569a	LOGIN	API	192.168.144.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 14:03:54.825048+00	\N
6abbbc22-2aa7-462f-8cda-ea3fc4cbb461	LOGIN	API	192.168.144.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-29 14:05:08.812954+00	\N
1d01e6be-0e5b-40b5-be24-55ccd77cbebf	LOGIN	API	192.168.144.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 14:18:54.824076+00	\N
6c733c8f-c559-4bc9-bbce-95811b03363c	LOGIN	API	192.168.144.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-29 14:20:08.798486+00	\N
a70f300f-5e01-47e5-9f2c-2ad4fce46efc	LOGIN	API	192.168.144.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 14:33:54.870481+00	\N
16846dc4-aa2d-46d0-8f7e-a133b21b02ad	LOGIN	API	192.168.160.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-05-29 14:37:47.605654+00	\N
17ca2fb8-e63c-42ff-8307-f7c8fe8c879e	LOGIN	API	192.168.176.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 14:49:04.904266+00	\N
9fbf948e-092c-40c7-98a7-ebf9266910dd	UPDATE	CITIZEN	192.168.176.1	Citizen resolved formal notification with status ACCEPTED	FORMAL_NOTIFICATION	5c96d3a7-48b4-4fcd-ba04-0d6924defcee	SUCCESS	2026-05-29 14:49:04.951134+00	3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c
ae931022-b9ed-4117-86eb-c1bc615cdd0d	LOGIN	API	192.168.176.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-05-29 14:49:57.300931+00	\N
48e44e14-c594-4945-82ad-3019ce204426	LOGIN	API	172.19.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-06-01 06:25:46.338273+00	\N
8aaed918-d584-4863-b349-45a5a9181af4	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-01 06:41:26.278447+00	\N
964fcda7-3fa1-42e2-819c-0783b360b097	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-01 06:56:26.347755+00	\N
7ab98310-5a08-442c-9707-c63d3ffe0855	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-01 07:11:43.506802+00	\N
2c413423-b827-491d-b584-306644ecb6b8	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-01 07:26:43.504353+00	\N
abcabd20-6e1e-4a92-82b2-04aeb9a8a828	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-01 07:41:43.506616+00	\N
06571816-aaf9-42ae-9314-d8a8107e9b04	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-01 07:56:43.529035+00	\N
d8cea819-d109-4149-8523-60d79acd370f	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-01 08:11:43.50728+00	\N
2fd6a39b-2eb4-4702-8366-39c38f1411a0	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-01 08:26:43.516975+00	\N
6b5a89af-1842-47ad-8c13-ceb80a4c1433	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-01 08:41:43.503559+00	\N
9a5b49d2-1def-475c-a626-9402ebbd9713	LOGIN	API	172.19.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-01 08:56:43.509785+00	\N
34bd58b7-dabc-4c8e-8acf-101b68dae68d	LOGIN	API	172.20.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-06-01 09:41:24.205156+00	\N
5222e941-e339-4d4b-87b4-e5a2edb5668c	LOGIN	API	172.21.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-01 09:56:45.436648+00	\N
4a1b0a42-5ad0-4cb9-b514-7bd7d1e5485f	LOGIN	API	172.18.0.1	Invalid password for admin@tfm.es	USER	\N	FAILURE	2026-06-01 20:41:04.244217+00	\N
c7c4548e-0553-40c3-a27d-cd2e422b0ad0	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-06-01 20:41:09.180682+00	\N
009967af-cbeb-4e63-bda6-eaf1af0ae509	LOGIN	API	172.18.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-01 20:56:37.881415+00	\N
6fb9dbf2-1990-4d87-91c9-501007e00451	LOGIN	API	172.18.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-01 21:11:37.852283+00	\N
fe6ccd0f-6e78-490d-a01e-daf5ccd792d4	LOGIN	API	172.20.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 08:14:59.583799+00	\N
7d875d3b-bb99-4a41-a25f-12b23b896bc0	LOGIN	API	172.20.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 08:29:59.801953+00	\N
4287d625-a097-4f68-ab3f-53c3a138d79b	LOGIN	API	172.20.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 08:44:59.623655+00	\N
54fe00ba-44a3-47ca-8bf8-7a6ae5f12310	LOGIN	API	172.20.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 09:00:26.837928+00	\N
085716d5-002d-48cc-ac4e-b1b1941ef3d0	LOGIN	API	172.20.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 09:15:26.863397+00	\N
7a1760bf-996f-4667-8bb4-d85a17b1eee2	LOGIN	API	172.20.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 09:30:26.841509+00	\N
f2a4529a-443a-4c81-8123-4a6c08846ec2	LOGIN	API	172.18.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 18:04:51.633941+00	\N
aabee383-c4d5-4c57-85d1-5f1f97cd58da	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 18:13:13.774271+00	\N
9cc2734b-7946-4384-8d41-3d475741f7b1	LOGIN	API	172.18.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 18:19:52.519685+00	\N
5c78de1d-1dbe-43f5-aa8b-c734071dbc92	LOGIN	API	172.18.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 18:28:22.057702+00	\N
f9c596ce-c626-4c04-aa3c-88ddefef9a24	LOGIN	API	172.18.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 18:35:21.771273+00	\N
21f87359-8b9a-4f57-8085-ea5f87593faa	LOGIN	API	172.18.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 18:43:52.564136+00	\N
91d20517-e1ae-47b9-a8c3-7c91d809f2dc	LOGIN	API	172.18.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 18:50:21.769202+00	\N
92613ad8-e7d1-429d-9de5-99a8836fbf77	LOGIN	API	172.18.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 18:58:52.459403+00	\N
4169c3f5-715b-470b-9a31-50b88975cc8d	LOGIN	API	172.18.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 19:05:21.824055+00	\N
556e3e7b-b5e0-44ca-8b57-b80242db5141	LOGIN	API	172.18.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 19:13:52.560598+00	\N
fe1d96df-d255-45d6-ab05-b6aec50d5cc7	LOGIN	API	172.18.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 19:20:21.848708+00	\N
a214d05d-0176-4a38-b883-99540d60a86b	LOGIN	API	172.19.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 20:20:04.064648+00	\N
158c1720-0bd3-4475-8419-5912392a35ee	LOGIN	API	172.20.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 20:36:51.427714+00	\N
d91ba94f-d681-45e7-89b5-98fdef394661	LOGOUT	API	172.20.0.1	User logout	USER	\N	SUCCESS	2026-06-02 20:36:52.040286+00	81151e14-514b-4b0e-8afb-d9353a48807a
d0226bad-29d1-49cd-b547-6d1434ffc018	LOGIN	API	172.20.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 20:37:07.413263+00	\N
970ddd60-775b-41e4-bafd-ee1247bfbc64	LOGIN	API	172.20.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 20:41:16.218386+00	\N
ca983a7e-27a4-48ad-af04-ec9a39432380	LOGIN	API	172.20.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 20:52:08.025922+00	\N
c58c044b-f134-4d52-bced-a8088da683c3	LOGOUT	API	172.20.0.1	User logout	USER	\N	SUCCESS	2026-06-02 20:52:08.423786+00	81151e14-514b-4b0e-8afb-d9353a48807a
e3a35ec7-8f00-4d46-8116-fbeb5fc218a8	LOGIN	API	172.20.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 20:52:47.78559+00	\N
deef1ab6-3db9-4c1d-a201-35f737b19920	LOGIN	API	172.20.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 20:56:52.728994+00	\N
ea049341-8454-47c1-9742-174bdf4398ea	LOGIN	API	172.20.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 21:07:47.962455+00	\N
f8faac4e-2d46-4e8c-a7db-53e03f0bd296	LOGIN	API	172.20.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 21:11:52.842546+00	\N
cf53cfe7-d320-4ef3-ac31-bed3a89b3c04	LOGIN	API	172.21.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 21:28:16.758367+00	\N
3149ab5b-0ddb-4327-a21a-b7a1db245ca0	LOGIN	API	172.21.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 21:31:09.965321+00	\N
8d3354da-9e1e-444e-8a26-8a5e96f841bf	LOGIN	API	172.23.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 21:56:10.709721+00	\N
f40b7eeb-4d88-4120-b911-2343a9ccb03b	LOGIN	API	172.23.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 22:01:07.414153+00	\N
de2c1a81-b6bb-4cf1-bdb4-6aa345176d8d	LOGIN	API	172.23.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 22:04:30.05736+00	\N
5b2c734b-185f-48fe-9651-09c45067559d	LOGIN	API	172.23.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 22:11:10.93231+00	\N
cd0ec6ff-0650-4048-9b87-90788b48974d	LOGIN	API	172.23.0.1	Token refresh failed - token hash mismatch for citizen@tfm.es	USER	\N	FAILURE	2026-06-02 22:16:07.468895+00	\N
86ebb472-9ed1-42dd-8fcf-59639c58e987	LOGIN	API	172.23.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-02 22:19:52.45484+00	\N
e5e0b1bc-8375-4f82-b572-39d2adbbc88e	LOGIN	API	172.23.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-02 22:26:10.794799+00	\N
995ab2e9-79a6-442c-9f36-969f99b59bae	LOGIN	API	172.24.0.1	Invalid password for admin@tfm.es	USER	\N	FAILURE	2026-06-03 11:37:03.194125+00	\N
19fc85ea-964c-4cd7-8a23-37a0ca5537cd	LOGIN	API	172.24.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 13:59:22.139177+00	\N
1f355174-2226-459f-af61-9f53843283e7	LOGIN	API	172.24.0.1	Invalid password for admin@tfm.es	USER	\N	FAILURE	2026-06-22 14:06:18.860284+00	\N
3b80c214-fd78-42c8-bb1a-fa054123166e	LOGIN	API	172.24.0.1	Login successful for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 14:06:56.333798+00	\N
78181872-0c5b-4483-a75d-2d4428557f33	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 14:14:21.093256+00	\N
7845dcd0-8cf1-4cb1-b142-bd3871eed556	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 14:22:12.838301+00	\N
de58bcb7-69a4-4781-848b-fac8ad2dbb4c	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 14:29:21.073136+00	\N
3ec7a47c-7b2f-478e-bf98-38c5fa8e4553	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 14:37:12.894581+00	\N
7b53a8fd-c9ec-480b-a037-1e090834f94f	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 14:44:21.084278+00	\N
66ee4908-043b-4c4c-810c-6ab349dd979d	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 14:52:12.871525+00	\N
dce20f57-0d9b-4093-a268-c8df207a1f4e	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 14:59:21.112222+00	\N
ebe1b58f-7c51-4d64-88cc-d176b929f07e	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 15:07:12.866714+00	\N
40bd54c0-d52f-454f-a906-fbe32b5a40dd	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 15:14:21.084697+00	\N
f374094a-89af-49b3-a32f-cb72a0891abe	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 15:22:12.871285+00	\N
b411943e-613f-400e-b035-c1c7f1a4f179	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 15:29:21.121018+00	\N
a596f3f7-2c7d-4e39-8c62-7a821f05e697	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 15:37:12.835055+00	\N
101736e1-643d-480e-8ed7-8bf74778719a	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 15:44:21.108174+00	\N
a194cefe-492d-4473-932c-d866ffd12b3a	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 15:52:12.834513+00	\N
87bd3ea0-336c-43e2-8339-0f8178bc87f5	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 15:59:21.123733+00	\N
5476644c-bbb3-41cf-b45d-648eec19c581	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 16:07:12.842435+00	\N
8006a729-be83-43a0-a048-3742cf26f412	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 16:14:21.06386+00	\N
1eed6b03-7de7-4b95-867f-69442f090632	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 16:22:12.832218+00	\N
d623bb9b-8b8b-4ba3-a961-f2f9e85d7c4f	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 16:29:21.115798+00	\N
f842a91d-666c-4d38-9f4d-82f92131e011	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 16:37:12.863609+00	\N
c723b837-1011-4f55-9706-f9d3609dd421	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 16:44:21.072766+00	\N
febd3b94-11db-49ea-b3ab-43bfe1d38d14	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 16:52:12.844286+00	\N
1ac7259f-2973-478f-8359-4f05f3a4ebc5	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 16:59:21.122421+00	\N
82c0a8c2-a4d0-40a5-b6d6-d5b3665a919e	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 17:07:12.860036+00	\N
48dc50db-cc49-4af6-9f8c-6bd289e1082f	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 17:15:12.86276+00	\N
da31d71f-5c16-46bd-820d-4ec7bf25e13d	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 17:22:12.835803+00	\N
529c19b3-8b98-4d5f-a8c5-fb2a00868567	LOGIN	API	172.24.0.1	Token refreshed for citizen@tfm.es	USER	\N	SUCCESS	2026-06-22 17:30:13.000074+00	\N
066ea8dd-c199-46d7-bb75-55a999b5f0e8	LOGIN	API	172.24.0.1	Token refreshed for admin@tfm.es	USER	\N	SUCCESS	2026-06-22 17:37:12.874315+00	\N
d668e244-5bfd-4f20-9633-e5db3cc44eb8	LOGIN	API	172.18.0.1	Login successful for citizen@tfm.es	USER	\N	SUCCESS	2026-06-23 17:41:30.573725+00	\N
\.


ALTER TABLE public.security_audit_log ENABLE TRIGGER ALL;

--
-- Data for Name: transparency_reports; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.transparency_reports DISABLE TRIGGER ALL;

COPY public.transparency_reports (id, created_at, description, file_name, file_path, file_size, mime_type, published, sort_order, title, updated_at, year) FROM stdin;
\.


ALTER TABLE public.transparency_reports ENABLE TRIGGER ALL;

--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: records_user
--

ALTER TABLE public.user_roles DISABLE TRIGGER ALL;

COPY public.user_roles (user_id, role) FROM stdin;
3ca3f719-8e80-4e77-b9a0-f8d2a5fc262c	ROLE_CITIZEN
81151e14-514b-4b0e-8afb-d9353a48807a	ROLE_CITIZEN
81151e14-514b-4b0e-8afb-d9353a48807a	ROLE_ADMIN
c0f909dd-f96b-4f75-80e2-c947dee7ce7b	ROLE_CITIZEN
ab3122ba-ab30-40b1-9c6e-15f23ac30b96	ROLE_CITIZEN
3068c439-cf23-4919-8be3-401d6e764bc4	ROLE_CITIZEN
4a83bdd8-e96c-48e8-9b86-e2a872fc7747	ROLE_CITIZEN
\.


ALTER TABLE public.user_roles ENABLE TRIGGER ALL;

--
-- PostgreSQL database dump complete
--

