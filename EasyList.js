import React, { Component} from 'react';

import { Text, View,  StyleSheet, FlatList} from 'react-native';

import ActivityIndicator from './Components/ActivityIndicator';

import Api from './Api';
import {Log, Warn, Utils} from './Utils';
import Authentication from './Authentication';
import Toast from './Components/Toast';

import Animated from 'react-native-reanimated';

const FlatListAnimated = Animated.createAnimatedComponent(FlatList);

const TAG = 'EasyList';
function log(data){
    if(!data) return;
    Log(`${TAG} > ${typeof data === 'string' ? data : JSON.stringify(data)}`);
}

class EasyListItem extends React.PureComponent {
    constructor(props) {
        super(props);
        if(this.props.renderItem){
            this.renderItem = this.props.renderItem;
        }
        if(props && props.index !== undefined){
            this.itemIndex = props.index;
        }
    }

    _onPress = () => {
        this.props.onPressItem(this.props.id);
    };

    itemClick = (item, action, index) => {
        this.props.onItemClicked(this, item, action, index);
    }

    forceRender(){
        this.setState({t : new Date()});
    }

    render(){
        let item = this.props.item;
        if(item.hidden) return null;
        if(this.renderItem){
            return this.renderItem(item, this.itemIndex, this.props.items, this.props.isBottom);
        }
        else{
            Warn('renderItem is required for EasyListItem.');
        }
    }
}

/**
 * class EasyList Super easy list to handle fetch data and display into Flat list.
 */
export default class EasyList extends React.PureComponent {
    _keyExtractor = (item, index) => item.id !== undefined ? item.id.toString() : '';
    minPostId = 0;
    maxPostId = 0;
    cloneItems = false;
    name = 'EasyList';
    paginate = false;
    useLengthStart = false;
    page = 0;
    animation = false;

    initialData = [];

    // pageSize = 0 mean using default return from server
    pageSize = 0;
    
    getName(){
        return this.name;
    }

    isCloneItems(){
        return this.cloneItems;
    }

    /**
     * 
     * @param {*} props 
     * NOTE: never use this.state = {...} in constructor of child element => error: refreshing is undefined
     */
    constructor(props) {
        super(props);

        let state = {
            items: [],
            loaded: false,
            refreshing: false,
            loading : false,
            canLoadMore : true,
            selected: (new Map()),
            indexItems : {}
        };
        
        this.state = state;
    }

    getInitItems(props){
        let items = props && props.items && props.items.length ? props.items : [];
        Log('EasyList > name: ' + this.getName());
        if(items.length){
            Log('EasyList > getInitItems > length: ' + items.length + ', clone: ' + this.isCloneItems());
            if(this.isCloneItems()){
                Log('EasyList > getInitItems > clone > length: ' + items.length);
                let clone = items.slice(0);
                return clone;
            }
        }
        return items;
    }

    init(props){
        let items = this.getInitItems(props);
        if(items && items.length){
            this.state.items = items;
        }

        if(this.initialData && this.initialData.length){
            Log(`EasyList > init > initialData: ${this.initialData.length}`)
            if(!this.state.items || !this.state.items.length){
                this.state.items = [...this.initialData];
            }
            else{
                this.initialData.forEach(e => {
                    this.state.items.push(e);
                })
            }
        }

        if(this.state.items && this.state.items.length){
            this.state.items.forEach(e => {
                this.state.indexItems[e.id] = e;
            });
            if(!this.paginate){
                this.updateMaxMin();
            }   
        }
    }

    getIndexOf(item){
        if(!this.state || !this.state.items || !this.state.items.length) return -1;
        return this.state.items.indexOf(item);
    }

    reset(){
        let newItems = [];
        let newIndexes = {};

        if(this.initialData && this.initialData.length){
            Log(`EasyList > reset > initialData: ${this.initialData.length}`)
            newItems = [...this.initialData];
            this.initialData.forEach(e => {
                newIndexes[e.id] = e;
            })
        }

        this.state.items = newItems;
        this.state.loaded = false;
        this.state.refreshing = false;
        this.state.loading = false;
        this.state.canLoadMore = true;
        this.state.selected = (new Map());
        this.state.indexItems = newIndexes;
        this.setState({
            items: newItems,
            loaded: false,
            refreshing: false,
            loading : false,
            canLoadMore : true,
            selected: (new Map()),
            indexItems : newIndexes
        });

        this.minPostId = 0;
        this.maxPostId = 0;
        this.page = 0;

        Log('EasyList > reset > max ' + this.maxPostId);
        this.getData();
    }

    removeItem = (item) => {
        let find = this.state.items.indexOf(item);
        if(find !== -1){
            const start = this.state.items.slice(0, find);
            const end = this.state.items.slice(find + 1);
            this.setState({
                items: start.concat(end),
            });
        }
    }

    /**
     * Gets item by position.
     * @param {number} index Position of item.
     */
    getItem(index){
        if(this.state.items[index]){
            return this.state.items[index];
        }
        return null;
    }

    clear = () => {
        this.setState({items : []});
        if(this.props.onUpdatedItem){
            this.props.onUpdatedItem(this.count());
        }
    }

    count(){
        return (this.state && this.state.items) ? this.state.items.length : 0;
    }

    onItemClicked = (view, item, action, index) => {
        let handlerName = Utils.convertFunctionName(action);
        if(this[handlerName]){
            this[handlerName](view, item, action, index);
        }
        else{
            Warn(handlerName + ' is not declared.');
        }

        if(this.onItemClick){
            this.onItemClick(view, item, action, index);
        }
    }

    componentDidMount(){
        this._isMounted = true;
        Log(`EasyList > componentDidMount > name: ${this.name}, api: ${this.api}`);
        this._onEndReached();
        this.componentDidMountAfter();
    }

    componentDidMountAfter(){

    }

    componentWillUnmount = () => {
        this._isMounted = false;
        this.componentWillUnmountAfter();
    }
    
    componentWillUnmountAfter(){

    }

    /**
     * Rerender item view.
     * @param {number} id Item ID
     */
    rerenderItem(id){
        // updater functions are preferred for transactional updates
        this.setState((state) => {
            // copy the map rather than modifying state.
            const selected = new Map(state.selected);
            selected.set(id, !selected.get(id)); // toggle
            return {selected};
        });
    }

    getItemById(id){
        return this.state.indexItems[id];
    }

    updateItems(newItems){
        let {items} = this.state;
        let bHasUpdate = false;

        const selected = new Map(this.state.selected);
        newItems.forEach(e => {
            let item = this.getItemById(e.id);
            if(item){
                Object.assign(item, e);
                bHasUpdate = true;
                selected.set(e.id, !selected.get(e.id));
            }
        });        
        if(bHasUpdate){
            Log('EasyList > updateItems > bHasUpdate');
            this.setState({items, selected,  t : new Date()});
        }
    }

    updateItem(item, newItem){
        if(!item || !newItem) return;
        Object.assign(item, newItem);
        Log('EasyList > updateItem > ' + item.id);
        this.rerenderItem(item.id);
    }

    _onPressItem = (id) => {
        // updater functions are preferred for transactional updates
        this.setState((state) => {
            // copy the map rather than modifying state.
            const selected = new Map(state.selected);
            selected.set(id, !selected.get(id)); // toggle
            return {selected};
        });
    };

    refreshItem = (item) => {
        // updater functions are preferred for transactional updates
        this.setState((state) => {
            // copy the map rather than modifying state.
            const selected = new Map(state.selected);
            // toggle
            selected.set(item.id, !selected.get(item.id)); 
            return {selected};
        });
    };

    search(params){
        if(!params) {
            return log('search > no data');
        }
        if(typeof params !== 'object') {
            return log('search > not object');
        }
        if(Array.isArray(params)){
            return log('search > does not support array.');
        }
        let tmp = {};
        let bHasNewParams = false;
        if(params){
            for(let k in params){
                tmp[k] = params[k];
                bHasNewParams = true;
            }
        }

        if(!bHasNewParams) return;
        if(!this.apiParams){
            this.apiParams = {};
        }
        Object.assign(this.apiParams, tmp);
        this.reset();
    }

    emptyRender(){
        return (
            <View style={{
                padding: 16
            }}>
                <Text>renderItem is required for EasyList</Text>
            </View>
        );
    }

    _renderItem = ({item, index}) => {
        if(item && item.id){
            this.state.indexItems[item.id] = item;
        }
        
        return (
            <EasyListItem
                key={item.id}
                hidden={item.hidden}
                item={item}
                id={item.id}
                onPressItem={this._onPressItem}
                selected={!!this.state.selected.get(item.id)}
                renderItem={this.renderItem ? this.renderItem : this.emptyRender}
                onItemClicked={this.onItemClicked}
                title={item.title}
                isBottom={index == this.state.items.length - 1 ? true : false}
            />
        )
    };

    _onEndReached = () =>{
        Log('EasyList > _onEndReached');
        if(!this.state.canLoadMore) {
            Log('EasyList > Cannot load more.');
            return;
        }
        this.getData();
    }

    updateMaxMin(){
        if(this.state.items && this.state.items.length){
            Log('EasyList > updateMaxMin > length ' + this.state.items.length);
            let lastItem = this.state.items[this.state.items.length - 1];
            if(!lastItem.is_virtual){
                this.maxPostId = lastItem.id;
            }
            let firstItem = this.state.items[0];
            if(!firstItem.is_virtual){
                this.minPostId = firstItem.id;
            }
        }
        else{
            this.maxPostId = 0;
            this.minPostId = 0;
        }
        Log('EasyList > max_id ' + this.maxPostId);
    }

    getParams(){
        return this.apiParams || false;
    }

    getData(){
        Log('EasyList > getData');
        if(this.authentication){
            if(!Authentication.isUser()) return;
        }
        if(!this.api){
            return Warn('API is required for EasyList.')
        }
        if(!this.itemsField){
            return Warn('ItemsField is required for EasyList.');
        }
        
        if(this.state.loading) return;
        this.setState({loading : true});

        let params = {};

        if(!this.paginate){
            this.updateMaxMin();
            params.max_id = this.maxPostId;
        }
        else{
            params.page = this.page;
            if(this.pageSize){
                params.length = this.pageSize;

                if(this.useLengthStart){
                    params.start = this.page * this.pageSize;
                }
            }
        }

        let apiParams = this.getParams();
        if(apiParams){
            for(let k in apiParams){
                params[k] = apiParams[k];
            }
        }

        let method = this.method || 'get';

        Api[method](this.api, params).then(response => {
            if(!this._isMounted) return;
            Log('EasyList > response');
            if(!response.status){ 
                Toast.show(response.message);
                this.setState({
                    loading : false,
                    canLoadMore : false
                });
            }
            else{
                if(response[this.itemsField] && response[this.itemsField].length){
                    response[this.itemsField].forEach(e => {
                        if(!this.state.indexItems[e.id]){
                            this.state.items.push(e);
                            this.state.indexItems[e.id] = e;
                        }
                        else{
                            Log('EasyList > item ' + e.id + ' is exists.');
                        }
                    });
                    Log('EasyList > getData > success');
                    if(!this.paginate){
                        this.updateMaxMin();
                    }
                    else{
                        this.page++;
                    }
                    let newState = {
                        loading: false,
                    };
                    if(response.length !== undefined){
                        if(response[this.itemsField].length < response.length){
                            newState['canLoadMore'] = false;
                        }
                    }
                    this.setState(newState);
                    if(this.props.onUpdatedItem){
                        this.props.onUpdatedItem(this.count());
                    }
                }
                else{
                    Log('EasyList > response > empty');
                    this.setState({
                        loading : false,
                        canLoadMore : false
                    });
                    if((!this.state.items || !this.state.items.length) && this.props.onEmptyItems){
                        this.props.onEmptyItems();
                    }
                }
            }
        })
        .catch(error => {
            Log('EasyList > catch > error');
            Log(error);
            if(!this._isMounted){
                return;
            }
            this.setState({loading : false});
            if(this.props.onGetDataFailed){
                this.props.onGetDataFailed(error);
            }
        });
    }

    onRefresh = () => {
        if(this.state.loading) return;
        if(!this.state.items || !this.state.items.length){
            return this.getData();
        }

        let refreshType = this.refreshType || 'reset';
        if(refreshType == 'reset'){
            this.reset();
            return;
        }
        this.setState({refreshing : true});

        let params = {};

        if(!this.paginate){
            this.updateMaxMin();

            params.min_id = this.minPostId;
            params.type = 'new';
        }
        else{
            return this.reset();
        }
        
        let apiParams = this.getParams();
        if(apiParams){
            for(let k in apiParams){
                params[k] = apiParams[k];
            }
        }

        Api.get(this.api, params).then((response) => {
            if(!this._isMounted) return;
            Log('EasyList > response');
            if(!response.status){ 
                Toast.show(response.message);
                this.setState({
                    refreshing : false,
                });
            }
            else{
                if(response[this.itemsField] && response[this.itemsField].length){
                    response[this.itemsField].forEach(e => {
                        if(!this.state.indexItems[e.id]){
                            this.state.items.splice(0, 0, e);
                            this.state.indexItems[e.id] = e;
                        }
                        else{
                            Log('EasyList > item ' + e.id + ' is exists.');
                        }
                    });
                    Log('EasyList > refresh > success');
                    if(!this.paginate){
                        this.updateMaxMin();
                    }
                    
                    let newState = {
                        refreshing: false,
                    };

                    this.setState(newState);
                    if(this.props.onUpdatedItem){
                        this.props.onUpdatedItem(this.count());
                    }
                }
                else{
                    Log('EasyList > response > empty');
                    this.setState({
                        refreshing : false
                    });
                    if((!this.state.items || !this.state.items.length) && this.props.onEmptyItems){
                        this.props.onEmptyItems();
                    }
                }
            }
        })
        .catch(error => {
            Log('EasyList > refresh > catch > error');
            Log(error);
            if(!this._isMounted){
                return;
            }
            this.setState({refreshing : false});
            if(this.props.onGetDataFailed){
                this.props.onGetDataFailed(error);
            }
        });
    }

    prepend(item){
        if(!this.state.indexItems[item.id]){
            this.state.items.splice(0, 0, item);

            if(!this.paginate){
                this.updateMaxMin();
            }
            
            // index this item
            this.state.indexItems[item.id] = item;
            Log('EasyList > prepend ' + item.id );
            // this.setState({reload : true});
            // updater functions are preferred for transactional updates
            this.setState((state) => {
                // copy the map rather than modifying state.
                const selected = new Map(state.selected);
                // toggle
                let id = item.id;
                selected.set(id, !selected.get(id)); 
                return {selected};
            });
        }
        else{
            Log('EasyList > item ' + item.id + ' is exists.');
        }
    }

    push(item){
        if(!this.state.indexItems[item.id]){
            this.state.items.push(item);
            if(!this.paginate){
                this.updateMaxMin();
            }
            
            // index this item
            this.state.indexItems[item.id] = item;

            this.setState((state) => {
                // copy the map rather than modifying state.
                const selected = new Map(state.selected);
                // toggle
                let id = item.id;
                selected.set(id, !selected.get(id)); 
                return {selected};
            });
        }
        else{
            Log('EasyList > item ' + item.id + ' is exists.');
        }
    }

    getEmptyText(){
        return this.props.emptyText || 'No items found.';
    }
    renderEmptyItems(){
        if(this.state && this.state.items && this.state.items.length || this.state.loading) return null;
        if(this.props.emptyText === false) return null;
        if(this.renderEmptyState){
            let tmp = this.renderEmptyState();
            if(tmp){
                return tmp;
            }
        }
        return (
            <View style={{
                height : 50,
                alignContent : 'center',
                justifyContent : 'center',
                alignItems : 'center'
            }}>
                <Text>{this.getEmptyText()}</Text>
            </View>
        );
    }

    renderFooter = () => {
        if (!this.state.loading) return null;

        if(this.props && this.props.renderLoading){
            return this.props.renderLoading();
        }

        if(this.renderLoading){
            return this.renderLoading();
        }
        return (
            <View
                style={{
                    paddingVertical: 20
                }}
            >
                <ActivityIndicator animating size="large" color={this.activityIndicatorColor || undefined} />
            </View>
        );
    };

    getContentContainerStyle(){
        return null;
    }

    getNumColumns(){
        return undefined;
    }

    scrollToIndex(index){
        if(!this.flatList) return;
        this.flatList.scrollToIndex({index : index});
    }

    scrollToTop(){
        if(!this.flatList) return;
        this.flatList.scrollToOffset({offset : 0});
    }

    scrollToOffset(offset){
        if(!this.flatList) return;
        this.flatList.scrollToOffset({offset : offset });
    }

    renderHeader = () => {
        if(!this.props || !this.props.renderHeader) return null;
        return this.props.renderHeader();
    }

    getInitialScrollIndex(){
        return this.props.index !== undefined ? this.props.index : undefined;
    }

    renderBottom(){

    }

    renderTop(){
        
    }

    render() {
        const FlatListComponent = this.animation ? FlatListAnimated : FlatList;
        return (
            <View style={{
                flex : 1
            }}> 
                {(!this.props || !this.props.renderHeader) && !this.renderEmptyState ? this.renderEmptyItems() : null}
                {this.renderTop()}
                <FlatListComponent
                    getItemLayout={this.getItemLayout || undefined}
                    initialScrollIndex={this.getInitialScrollIndex()}
                    ref={(c) => this.flatList = c}
                    pagingEnabled={this.pagingEnabled ? true : false}
                    horizontal={this.horizontal ? true : false}
                    numColumns={this.getNumColumns()}
                    contentContainerStyle={this.getContentContainerStyle()}
                    data={this.state.items}
                    extraData={this.state}  
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                    onEndReached={this._onEndReached}
                    onEndReachedThreshold={this.onEndReachedThreshold || 100}
                    ListFooterComponent={this.renderFooter}
                    ListHeaderComponent={this.renderHeader}
                    onMomentumScrollEnd={this.onMomentumScrollEnd}
                    onMomentumScrollBegin={this.onMomentumScrollBegin}
                    onScrollBeginDrag={this.onScrollBeginDrag}
                    onScrollEndDrag={this.onScrollEndDrag}
                    onScroll={this.props.onScroll || this.onScroll}
                    scrollEventThrottle ={this.scrollEventThrottle }
                    inverted={this.inverted || undefined}
                    onRefresh={this.disablePullToRefresh ? undefined: this.onRefresh}
                    refreshing={this.state.refreshing}
                    onViewableItemsChanged={this.onViewableItemsChanged}
                    viewabilityConfig={this.viewabilityConfig}
                    stickyHeaderIndices={this.props.stickyHeaderIndices}
                />
                {(this.props && this.props.renderHeader) || this.renderEmptyState ? this.renderEmptyItems() : null}

                {this.renderBottom()}
            </View>
        );
    }
}

var styles = StyleSheet.create({
    layout : {
        padding: 8,
        flex: 1
    },
    nothing : {

    },
    hide : {
        display : 'none'
    },
    postItem : {
        padding: 8,
        shadowColor : '#333333',
        shadowOffset : {
            width : 4,
            height: 4 
        },
        elevation : 4,
        backgroundColor : '#fff',
        marginBottom : 8,
        marginTop : 8,
        borderRadius : 4,
        marginLeft: 8,
        marginRight : 8
    },
    iconAction : {
        width: 48,
        height : 48,
        textAlign : 'center',
        backgroundColor : '#ccc',
        lineHeight : 36,
        borderRadius: 48,
        marginLeft : 8,
        marginRight : 8
    }
});