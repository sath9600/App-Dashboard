-- Seed data from UBC Security Questions.xlsx

-- Privacy and Info Security - General
INSERT INTO questions (category_id, question_number, question_text, answer_text, keywords) VALUES 
(1, '1', 'Does your organization have a CISO assigned?', 'Our Global IT Head is appointed as the Information Security Officer of the organization.', 'CISO chief information security officer organization assigned'),
(1, '2', 'Is there a Information Security Management System in place? Does this meet formal standards for your industry (e.g. certifications such as ISO27001 or similar available)? Please provide your Information Security Policy', 'Yes, our ISMS is ISO27001:2022 certified. attach information security policy', 'ISMS information security management system ISO27001 certification policy standards'),
(1, '3', 'Will your company store, transmit, or access Personal Information (e.g., information about our customers, employees, agents, and providers)? What type of information?', 'For delivery team', 'personal information PII store transmit access customers employees agents providers'),
(1, '4', 'Will your company have access to any of our company''s intellectual property (e.g., logo, copyrights, trademarks, trade secrets, etc.) during the course of the engagement?', 'For delivery team', 'intellectual property IP logo copyrights trademarks trade secrets engagement access'),
(1, '5', 'In what jurisdictions does your company collect information?', 'For delivery team', 'jurisdictions collect information data location geography'),
(1, '6', 'Do you have a Data Privacy Impact Assessment (DPIA)? Can you provide your Data Privacy Impact Assessment (DPIA) to UBC with this questionnaire.', 'Ram - our DPIA here in PH is conducted on the non-delivery groups handling PH PII data only (HR, Recruitment, etc)', 'DPIA data privacy impact assessment PII HR recruitment Philippines');

-- Policies and Privacy Program
INSERT INTO questions (category_id, question_number, question_text, answer_text, keywords) VALUES 
(2, '1', 'Does your company have policies, procedures, and training in place to address data privacy and cyber-security expectations and regulations? Please provide copies for review.', 'Yes attach data privacy policy, guidelines', 'policies procedures training data privacy cyber security regulations guidelines'),
(2, '2', 'Does your company update privacy and security policies, procedures, and training regularly?', 'Yes', 'update privacy security policies procedures training regularly'),
(2, '3', 'Are all employees required to complete annual information security training?', 'Yes', 'employees required annual information security training mandatory'),
(2, '4', 'Does your company have a data breach response plan? Please provide a copy for review.', 'For Ram', 'data breach response plan incident management procedure'),
(2, '5', 'How often does your company review and test their privacy incident and breach management program?', 'Annually', 'review test privacy incident breach management program annually yearly'),
(2, '6', 'What is your company''s procedure for notifying us of a data breach or other event?', 'The Engagement Manager will notify her counterpart in UBC via email once a data breach or security incident is confirmed to have impact on the client data.', 'procedure notifying data breach security incident engagement manager email client impact'),
(2, '7', 'Have you experienced any information security breaches in the past three years?', 'No', 'experienced information security breaches past three years history'),
(2, '8', 'Do you have insurance coverage for information security incidents?', 'For Ram', 'insurance coverage information security incidents cyber liability'),
(2, '9', 'Do you perform internal security risk assessments?', 'Yes', 'internal security risk assessments vulnerability evaluation'),
(2, '10', 'Does your company monitor appropriate sources for new government laws, regulations, and directives? Who is responsible for and what actions are taken when new laws, regulations, and directives impact deployed security solutions or technologies?', 'We suscribe to different organizations as relevant sources of information related to government laws and regulations and email alerts are received via email. IT, HR, ISMS would assess impact to Myridius operations and systems and determine actions to be taken to address the requirements.', 'monitor government laws regulations directives compliance legal requirements IT HR ISMS impact assessment'),
(2, '11', 'Does your company''s legal department review all contracts and service-level agreements for consistency with its policies and procedures for data privacy and cyber-security?', 'Yes', 'legal department review contracts service level agreements SLA consistency policies procedures data privacy cyber security');

-- Internal Access
INSERT INTO questions (category_id, question_number, question_text, answer_text, keywords) VALUES 
(3, '1', 'Please explain how your company determines who has access to each specific class of information. Is information access granted to individuals based on a need-to-know basis?', 'All users are assigned a unique Active Directory user account linked to their employee ID. Group memberships (e.g., security groups, distribution lists) are aligned with the user''s job role and least-privilege principle.', 'access control information classification need to know Active Directory user account employee ID security groups least privilege'),
(3, '2', 'Are all employees involved in processing customer data appropriately trained on privacy policies and data handling procedures?', 'Yes', 'employees processing customer data trained privacy policies data handling procedures'),
(3, '3', 'How do you verify the identity of those accessing data at your company?', 'An authorization mechanism that controls the privileges granted to each user is required for all Myridius systems. The Myridius Project Manager for the client engagement is responsible for ensuring that each individual system''s governed role matches the privileges that user is entitled to receive. Users will only be given sufficient rights to all systems to enable them to perform their job function. User rights will be kept to a minimum at all times.', 'verify identity accessing data authorization mechanism privileges user rights job function minimum access project manager'),
(3, '4', 'Does your company require employees and contractors to sign confidentiality and data security agreements?', 'Yes, it is incorporated in our employmen agreement template.', 'employees contractors confidentiality data security agreements employment template NDA'),
(3, '5', 'Are security activity and violations logged and reported?', 'Yes', 'security activity violations logged reported monitoring audit trail'),
(3, '6', 'Does your company maintain a codified process for immediate disabling or modification of access when a temporary employee, contractor, or third party''s status changes (e.g., termination, transfer, end of contract)?', 'For Ram', 'codified process disabling modification access temporary employee contractor third party termination transfer contract'),
(3, '7', 'Does your company have procedures in place to securely dispose of sensitive information, regardless of how it is stored (paper, disk, etc.)?', 'Yes', 'procedures securely dispose sensitive information paper disk storage media destruction');

-- Security Controls
INSERT INTO questions (category_id, question_number, question_text, answer_text, keywords) VALUES 
(4, '1', 'Does your company have a formal IT department? A full-time information security staff?', 'Yes', 'formal IT department full time information security staff dedicated team'),
(4, '2', 'What media will you use to store electronic sensitive information on our behalf?', 'For Ram', 'media store electronic sensitive information storage devices systems'),
(4, '3', 'Where, physically, will any data containing electronic information be located? (on-site location, SaaS, cloud) please specify region', 'For Ram', 'physically data electronic information located on site SaaS cloud region geography'),
(4, '4', 'Can your company provide evidence that it has the controls in place to ensure data collection, access, management, security, and retention is done properly and in accordance with the appropriate laws and regulations?', 'Yes', 'evidence controls data collection access management security retention laws regulations compliance'),
(4, '5', 'What is your encryption policy?', 'Access to RCG information systems shall be encrypted. Users will be given application/protocol access with the current encryption algorithm that is defined based on Myridius standards. Hard disk using SSD technology are encrypted by default. In addition, BitLocker should be installed on laptops.', 'encryption policy RCG information systems encrypted application protocol algorithm SSD BitLocker laptops'),
(4, '6', 'Do you employ firewalls to protect systems that may contain sensitive information?', 'Yes', 'firewalls protect systems sensitive information network security perimeter'),
(4, '7', 'Do you require the use of security tokens or unique user IDs, strong passwords to access PII, password-activated screen savers, and automatic log-off features on your computers?', 'Yes', 'security tokens unique user IDs strong passwords PII password activated screen savers automatic log off computers'),
(4, '8', 'Is anti-virus software installed on your e-mail gateways, servers, desktops, and laptops?', 'Yes', 'anti virus software email gateways servers desktops laptops malware protection'),
(4, '9', 'Do you conduct internal audits on technology controls currently in place?', 'Yes', 'internal audits technology controls audit assessment review'),
(4, '10', 'Does your company have measures in place to address data that is lost or that becomes temporarily unavailable? Please provide details', 'For Ram', 'measures data lost temporarily unavailable backup recovery disaster continuity');

-- Physical Safeguards
INSERT INTO questions (category_id, question_number, question_text, answer_text, keywords) VALUES 
(5, '1', 'Are all physical entry points to your facility protected against unauthorized entry by locks, card readers, guards, etc.?', 'Yes', 'physical entry points facility protected unauthorized entry locks card readers guards access control'),
(5, '2', 'Is all visitor and vendor access to your company''s facility logged to maintain a physical audit trail of visitor activity?', 'Yes', 'visitor vendor access facility logged physical audit trail visitor activity monitoring'),
(5, '3', 'Where will your company store hard-copy sensitive information?', 'Hardcopy sensitive information are kept in locked filing cabinets that are inside a restricted access room.', 'store hard copy sensitive information locked filing cabinets restricted access room physical security'),
(5, '4', 'Are physical security measures are in place to protect your company''s information assets? Provide details', 'CCTV on all entrance/ exit of the facilities, proximity card or biometric scan door access, fire extinguishers, door alarms if left open.', 'physical security measures information assets CCTV entrance exit proximity card biometric scan door access fire extinguishers alarms');

-- Operations in the EU & ROW
INSERT INTO questions (category_id, question_number, question_text, answer_text, keywords) VALUES 
(6, '1', 'Will you be collecting data from the European Union or other countries outside of the USA?', 'For delivery team', 'collecting data European Union EU countries outside USA international operations'),
(6, '2', 'If so, do you comply with the EU-US Privacy Shield Framework?', 'Yes', 'comply EU US Privacy Shield Framework international data transfer'),
(6, '3', 'Are you currently in compliance with GDPR? If not, what steps do you have in place to work towards compliance?', 'Yes', 'compliance GDPR General Data Protection Regulation European privacy law');

-- Information Sharing to Other Third Parties
INSERT INTO questions (category_id, question_number, question_text, answer_text, keywords) VALUES 
(7, '1', 'Will your company transmit sensitive information to any additional third parties?', 'For delivery team', 'transmit sensitive information additional third parties data sharing'),
(7, '2', 'What data privacy and cyber-security requirements does your company require of its third parties (fourth parties)? How will you ensure that appropriate information security safeguards are in place?', 'Signed NDA, Information Security and Data Privacy Awareness Training.', 'data privacy cyber security requirements third parties fourth parties NDA information security data privacy awareness training safeguards');
