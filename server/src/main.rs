#![feature(decl_macro)]

#[macro_use]
extern crate rocket;

use rocket::response::NamedFile;
use rocket::response::Redirect;

use std::path::{Path, PathBuf};

#[get("/demo/<file..>")]
fn demo(file: PathBuf) -> Option<NamedFile> {
    if file.extension().is_none() {
        NamedFile::open(Path::new("../dist/index.html")).ok()
    } else {
        NamedFile::open(Path::new("../dist/").join(file)).ok()
    }
}

#[get("/")]
fn index() -> Redirect {
    Redirect::to(uri!(demo: "3102f4b0-5b66-4a5c-b51e-033da2ac2b2f"))
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
