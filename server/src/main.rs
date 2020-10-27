#![feature(decl_macro)]

#[macro_use]
extern crate rocket;

use rocket::response::NamedFile;

use std::path::{Path, PathBuf};

#[get("/")]
fn index() -> Option<NamedFile> {
    NamedFile::open(Path::new("../dist/index.html")).ok()
}

#[get("/demo/<file..>")]
fn demo(file: PathBuf) -> Option<NamedFile> {
    if file.extension().is_none() {
        NamedFile::open(Path::new("../dist/index.html")).ok()
    } else {
        NamedFile::open(Path::new("../dist/").join(file)).ok()
    }
}

#[get("/static/<file..>")]
fn static_files(file: PathBuf) -> Option<NamedFile> {
    let path = Path::new("../static/").join(file);
    println!("{:?}", path);
    NamedFile::open(path).ok()
}

#[get("/audio/<file..>")]
fn audio_files(file: PathBuf) -> Option<NamedFile> {
    let path = Path::new("../audio/").join(file);
    println!("{:?}", path);
    NamedFile::open(path).ok()
}

fn main() {
    rocket::ignite()
        .mount("/", routes![index, demo, static_files, audio_files])
        .launch();
}
