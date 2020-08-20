#![feature(decl_macro)]

#[macro_use]
extern crate rocket;

use rocket::response::NamedFile;

use std::path::{Path, PathBuf};

#[get("/")]
fn index() -> Option<NamedFile> {
    NamedFile::open(Path::new("../dist/index.html")).ok()
}

#[get("/<file..>")]
fn files(file: PathBuf) -> Option<NamedFile> {
    if file.starts_with("static") || file.starts_with("audio") {
        let path = Path::new("../").join(file);
        println!("{:?}", path);
        NamedFile::open(path).ok()
    } else {
        NamedFile::open(Path::new("../dist/").join(file)).ok()
    }
    
}


fn main() {
    rocket::ignite()
        .mount("/", routes![ index, files ])
        .launch();
}
