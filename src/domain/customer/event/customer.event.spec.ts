import EventDispatcher from "../../@shared/event/event-dispatcher";
import Customer from "../entity/customer";
import Address from "../value-object/address";
import CustomerChangeAddressEvent from "./customer-change-address.event";
import CustomerCreatedEvent from "./customer-created.event";
import EnviaConsoleLogHandler from "./handler/envia-console-log-handler";
import EnviaConsoleLog1Handler from "./handler/envia-console-log1-handler";
import EnviaConsoleLog2Handler from "./handler/envia-console-log2-handler";

describe("Customer events tests", () => {
    it("Should created customer", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandlerEnviaConsoleLog1 = new EnviaConsoleLog1Handler();
        const eventHandlerEnviaConsoleLog2 = new EnviaConsoleLog2Handler();
        const spyEventHandlerEnviaConsoleLog1 = jest.spyOn(eventHandlerEnviaConsoleLog1, "handle");
        const spyEventHandlerEnviaConsoleLog2 = jest.spyOn(eventHandlerEnviaConsoleLog2, "handle");

        const customer = new Customer("123", "Customer 1");
        const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
        customer.Address = address;

        eventDispatcher.register("CustomerCreatedEvent", eventHandlerEnviaConsoleLog1);
        eventDispatcher.register("CustomerCreatedEvent", eventHandlerEnviaConsoleLog2);
        const customerCreatedEvent = new CustomerCreatedEvent(customer);

        // Quando o notify for executado o EnviaConsoleLog1Handler.handle() deve ser chamado
        eventDispatcher.notify(customerCreatedEvent);

        expect(spyEventHandlerEnviaConsoleLog1).toHaveBeenCalled();
        expect(spyEventHandlerEnviaConsoleLog2).toHaveBeenCalled();
    })

    it("Should Change Address customer", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandlerEnviaConsoleLog = new EnviaConsoleLogHandler();
        const spyEventHandlerEnviaConsoleLog = jest.spyOn(eventHandlerEnviaConsoleLog, "handle");

        const customer = new Customer("123", "Customer 1");
        const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
        customer.Address = address;

        eventDispatcher.register("CustomerChangeAddressEvent", eventHandlerEnviaConsoleLog);
        const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");
        customer.changeAddress(address2);

        const customerChangeAddressEvent = new CustomerChangeAddressEvent(customer);

        // Quando o notify for executado o EnviaConsoleLogHandler.handle() deve ser chamado
        eventDispatcher.notify(customerChangeAddressEvent);

        expect(spyEventHandlerEnviaConsoleLog).toHaveBeenCalled();
    })

});