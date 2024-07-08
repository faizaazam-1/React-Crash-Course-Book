
import './App.css'
import { useReducer, useState, useEffect, useRef} from 'react';

const welcome = {
  title : "React",
  greeting :"Hello"
}

function getgreeting(){
    return welcome.greeting + welcome.title
}

 const storiesReducer =(state,action) =>{
  switch (action.type) {
   case 'STORIES_FETCH_INIT':
   return {
     ...state,
     isLoading:true,
     isError:false,
   };
   case 'STORIES_FETCH_SUCESS'  :
     return {
       ...state, 
       isLoading :false,
       isError: false,
       data: action.payload
     }
     case 'STORIES_FETCH_FAILURE':
       return {
         ...state,
         isLoading: false, 
         isError: true,
       }

   case 'REMOVE_STORY':
     return {
       ...state,
       data: state.data.filter(
         (story) => action.payload.objectID !== story.objectID
       )
     } ;
   default:
     throw new Error();
 }

};

const useStorageState = (key, initialState) => {
  const [value, setValue] = useState(
    localStorage.getItem(key) || initialState
  );

  useEffect(() => {
    localStorage.setItem(key, value)
  },[key,value]);
  
  return[value, setValue];
}

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => 
{
  const [searchTerm, setSearchTerm] = useStorageState("search","");

  const [stories, dispatchStories] = useReducer (storiesReducer,
     {data : [], isLoading : false, isError : false }
    )

    useEffect(() => {
    // if `searchTerm` is not present
    // e.g. null, empty string, undefined
    // do nothing
    // more generalized condition than searchTerm === ''

    if (!searchTerm) return;

      dispatchStories({type:'STORIES_FETCH_INIT'})
  
     fetch(`${API_ENDPOINT}${searchTerm}`)
     .then((response) => response.json())
     .then((result) => {
        dispatchStories({type: 'STORIES_FETCH_SUCESS', payload: result.hits
        });
       })

      .catch(() => dispatchStories({type: 'STORIES_FETCH_FAILURE'})
        )   
    }, [searchTerm]);

    const handleRemoveClick = (item) => {
   
    
      dispatchStories({
        type: 'REMOVE_STORY', payload: item});
    };
  
    const handleSearch = (event) => {
    
      setSearchTerm(event.target.value);
      
    };

  return(
    <div>
      <h1>{getgreeting()}</h1>
      <h2>My Hacker Stories</h2>

      <InputWithLabel
      id="search" 
      value = {searchTerm} 
      onInputChange = {handleSearch} 
      isFocused={true}>
      <strong>Search:</strong>
      </InputWithLabel>
     
      {stories.isError && <p>Something went wrong ...</p>}
      
      {stories.isLoading? (<p>Loading</p>) : 

      ( 
     <List 
     list={stories.data} 
     onRemoveItem={handleRemoveClick}/>)}
    </div>
    )
}; 

const InputWithLabel = ({id, children, value, type="text", onInputChange, isFocused }) =>{
 
  const inputRef =  useRef();
  useEffect(()=>{
    if(isFocused && inputRef.current)
      {
        inputRef.current.focus();
      }
  },[isFocused]);
    return(

          <>
                <label htmlFor={id}>{children}</label>
                &nbsp;
                <input ref={inputRef} id={id} value={value} type={type} onChange={onInputChange} />   
          </>

        )
};

const List = ({list, onRemoveItem})=>
{
  console.log("listrender")
 return(   <ul>
        {list.map(item => (
          <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem}/>//item={item}
          
        ))}
      </ul>
)
}

const Item = ({item, onRemoveItem}) =>
(
    <li>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type='button' onClick={()=>{onRemoveItem(item)}}>Dismiss</button>
      </span>
    </li>
)

export default App
