class MobiService{
    getLanguage(){
        return this.lang || 'en';
    }

    setLanguage(lang){
        this.lang = lang;
        return this;
    }

    setFullscreen(b){
        this.fullscreen = b;
    }

    isFullscreen(){
        return this.fullscreen || false;
    }
}

const Mobi = new MobiService();
export default Mobi;