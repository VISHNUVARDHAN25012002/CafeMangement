create table user(
    id int primary key auto_increment,
    name varchar(250),
    contactNumber varchar(20),
    email varchar(50),
    password varchar(250),
    status varchar(20),
    role varchar(20),
    UNIQUE(email)
);

INSERT INTO user (name, contactNumber, email, password, status, role) 
VALUES ('admin', '1234567890', 'vishnu@gmail.com', 'admin', 'true', 'admin');

create table category(
    id int not null auto_increment,
    name varchar(255) not null,
    primary key (id)
);


create table product(
    id int not null auto_increment,
    name varchar(255) not null,
    categoryId integer not null,
    description varchar(255),
    price integer,
    status varchar(20),
    primary key(id)
);

create table bill(
    id int not null auto_increment,
    uuid varchar(200) not null,
    name varchar(2550) not null,
    email varchar (255) not null,
    contactNumber varchar(20) not null,
    paymentMethod varchar(50) not null,
    total int not null,
    productDetails json default null,
    createdBy varchar(255) not null,
    primary key(id)
);