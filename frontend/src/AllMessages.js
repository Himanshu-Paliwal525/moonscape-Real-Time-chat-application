const AllMessages = ({ messages }) => {
    return (
        <div>
            {messages.map((msg) => {
                return (
                    <div>
                        <h4>{msg.user}</h4>
                        <p>{msg.message}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default AllMessages;
