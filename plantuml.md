@startuml
skinparam linetype ortho

entity PALMPAYDEVICES {
\*sn_palmpay (PK)
--
merchant_id (FK)
sn_edc (FK)
}

entity EDC_DEVICES {
\*sn_edc (PK)
--
device_id
merchant_id (FK)
sn_palmpay (FK)
}

entity MERCHANTS {
\*merchant_id (PK)
--
merchant_name
email
phone_number
password
address
}

entity USERS_BANK {
\*user_id (PK)
--
username
email
phone_number
nik
palmpay_image
balance
}

entity TRANSACTIONS {
\*transaction_id (PK)
--
transaction_type
user_id (FK)
amount
status
timestamp
merchant_id (FK)
sn_edc (FK)
}

entity PAYMENTS {
\*payment_id (PK)
--
transaction_id (FK)
payment_method
payment_status
amount
paid_at
}

' Relationships'
MERCHANTS "1" -- "N" EDC_DEVICES : "has"
MERCHANTS "1" -- "N" PALMPAYDEVICES : "has"

EDC_DEVICES "1" -- "1" PALMPAYDEVICES : "is paired with"

USERS_BANK "1" -- "N" TRANSACTIONS : "can have"
MERCHANTS "1" -- "N" TRANSACTIONS : "can have"
EDC_DEVICES "1" -- "N" TRANSACTIONS : "can use"

TRANSACTIONS "1" -- "N" PAYMENTS : "can have"
@enduml
